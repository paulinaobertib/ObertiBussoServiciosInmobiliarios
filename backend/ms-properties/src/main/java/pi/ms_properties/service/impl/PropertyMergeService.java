package pi.ms_properties.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pi.ms_properties.domain.Currency;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.Status;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.domain.WasiPropertySync;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.IWasiPropertySyncRepository;
import pi.ms_properties.security.SecurityUtils;
import pi.ms_properties.service.interf.IPropertyService;
import pi.ms_properties.specification.PropertySpecification;
import pi.ms_properties.wasi.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyMergeService {

    private final ObjectMapper objectMapper;

    private final IPropertyRepository propertyRepository;
    private final IWasiPropertySyncRepository syncRepository;
    private final WasiMapper wasiMapper;
    private final WasiApiProperties wasiApiProperties;
    private final WasiPropertyListCache wasiPropertyListCache;
    private final WasiApiClient wasiApiClient;
    private final IPropertyService propertyService;

    public List<PropertyDTO> getAllMerged() {
        boolean admin = SecurityUtils.isAdmin();
        List<PropertyDTO> locals = propertyRepository.findAll().stream()
                .map(propertyService::mapToDto)
                .map(d -> decorateLocal(d, admin))
                .collect(Collectors.toCollection(ArrayList::new));
        locals.addAll(fetchWasiDtosExcludingLinked(admin, n -> true));
        locals = applySourceFilter(locals, null, admin);
        if (!admin) {
            locals.forEach(this::stripAdmin);
        }
        return locals;
    }

    public List<PropertyDTO> getAvailableMerged() {
        boolean admin = SecurityUtils.isAdmin();
        List<PropertyDTO> locals = propertyRepository.findByStatus(Status.DISPONIBLE).stream()
                .map(propertyService::mapToDto)
                .map(d -> decorateLocal(d, admin))
                .collect(Collectors.toCollection(ArrayList::new));
        locals.addAll(fetchWasiDtosExcludingLinked(admin, this::isWasiAvailable));
        locals = applySourceFilter(locals, null, admin);
        if (!admin) {
            locals.forEach(this::stripAdmin);
        }
        return locals;
    }

    public List<PropertyDTO> searchMerged(
            BigDecimal priceFrom, BigDecimal priceTo,
            float areaFrom, float areaTo,
            float coveredAreaFrom, float coveredAreaTo,
            List<Float> rooms, String operation, List<String> types,
            List<String> amenities, List<String> cities, List<String> neighborhoods, List<String> neighborhoodTypes,
            Boolean credit, Boolean financing,
            Currency currency, Status status,
            Integer garagesMin, String condition, Boolean forTransfer, String source) {
        if (status != null && !SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo los administradores puede filtrar por estado.");
        }
        boolean admin = SecurityUtils.isAdmin();
        Specification<Property> spec = Specification
                .where(PropertySpecification.hasPriceFrom(priceFrom))
                .and(PropertySpecification.hasPriceTo(priceTo))
                .and(PropertySpecification.hasAreaFrom(areaFrom))
                .and(PropertySpecification.hasAreaTo(areaTo))
                .and(PropertySpecification.hasCoveredAreaFrom(coveredAreaFrom))
                .and(PropertySpecification.hasCoveredAreaTo(coveredAreaTo))
                .and(PropertySpecification.hasRooms(rooms))
                .and(PropertySpecification.hasOperation(operation))
                .and(PropertySpecification.hasType(types))
                .and(PropertySpecification.hasAmenity(amenities))
                .and(PropertySpecification.hasCity(cities))
                .and(PropertySpecification.hasNeighborhood(neighborhoods))
                .and(PropertySpecification.hasNeighborhoodType(neighborhoodTypes))
                .and(PropertySpecification.hasCredit(credit))
                .and(PropertySpecification.hasFinancing(financing))
                .and(PropertySpecification.hasCurrency(currency))
                .and(PropertySpecification.hasStatus(status))
                .and(PropertySpecification.hasGaragesMin(garagesMin))
                .and(PropertySpecification.hasPropertyConditionFilter(condition));

        List<PropertyDTO> locals = propertyRepository.findAll(spec).stream()
                .map(propertyService::mapToDto)
                .map(d -> decorateLocal(d, admin))
                .collect(Collectors.toCollection(ArrayList::new));

        locals.addAll(fetchWasiDtosExcludingLinked(admin,
                n -> matchesWasiSearch(n, priceFrom, priceTo, areaFrom, areaTo, coveredAreaFrom, coveredAreaTo,
                        rooms, operation, types, currency, status, garagesMin, condition, forTransfer)));

        locals = applySourceFilter(locals, source, admin);
        if (!admin) {
            locals.forEach(this::stripAdmin);
        }
        return locals;
    }

    public List<PropertyDTO> textSearchMerged(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        boolean admin = SecurityUtils.isAdmin();
        Specification<Property> specification = PropertySpecification.textSearch(value);
        List<PropertyDTO> locals = propertyRepository.findAll(specification).stream()
                .map(propertyService::mapToDto)
                .map(d -> decorateLocal(d, admin))
                .collect(Collectors.toCollection(ArrayList::new));

        String v = value.toLowerCase(Locale.ROOT);
        locals.addAll(fetchWasiDtosExcludingLinked(admin, n -> {
            String t = (text(n, "title") + " " + text(n, "observations")).toLowerCase(Locale.ROOT);
            return t.contains(v);
        }));

        locals = applySourceFilter(locals, null, admin);
        if (!admin) {
            locals.forEach(this::stripAdmin);
        }
        return locals;
    }

    public PropertyDTO fetchWasiSynthetic(long syntheticId, boolean admin) {
        if (syntheticId < WasiMapper.SYNTHETIC_ID_BASE) {
            return null;
        }
        int wid = (int) (syntheticId - WasiMapper.SYNTHETIC_ID_BASE);
        if (!wasiApiProperties.isConfigured()) {
            return null;
        }
        try {
            JsonNode root = wasiApiClient.getProperty(wid, false);
            if (root == null || !WasiJsonUtil.isSuccess(root)) {
                return null;
            }
            JsonNode prop = root;
            if (!prop.has("id_property")) {
                var it = root.elements();
                while (it.hasNext()) {
                    JsonNode x = it.next();
                    if (x != null && x.isObject() && x.has("id_property")) {
                        prop = x;
                        break;
                    }
                }
            }
            PropertyDTO dto = wasiMapper.fromWasiProperty(prop, admin);
            if (!admin) {
                stripAdmin(dto);
            }
            return dto;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Lightweight property maps for AI flow (merged local + Wasi, keyword pre-filter).
     */
    public List<Map<String, Object>> buildAiPropertyCandidates(String userQuery, int maxItems) {
        boolean admin = true;
        List<PropertyDTO> all = propertyRepository.findAll().stream()
                .map(propertyService::mapToDto)
                .map(d -> decorateLocal(d, admin))
                .collect(Collectors.toCollection(ArrayList::new));
        all.addAll(fetchWasiDtosExcludingLinked(admin, n -> true));

        String q = userQuery == null ? "" : userQuery.toLowerCase(Locale.ROOT);
        String[] tokens = q.split("\\s+");

        record Scored(PropertyDTO dto, int score) {}
        List<Scored> scored = new ArrayList<>();
        for (PropertyDTO p : all) {
            String blob = (p.getTitle() + " " + p.getDescription() + " " + typeName(p) + " "
                    + (p.getNeighborhood() != null ? p.getNeighborhood().getName() : "")).toLowerCase(Locale.ROOT);
            int s = 0;
            if (tokens.length == 0 || q.isBlank()) {
                s = 1;
            } else {
                for (String t : tokens) {
                    if (t.length() > 2 && blob.contains(t)) {
                        s++;
                    }
                }
            }
            scored.add(new Scored(p, s));
        }
        scored.sort((a, b) -> Integer.compare(b.score(), a.score()));
        List<Map<String, Object>> out = new ArrayList<>();
        int n = Math.min(maxItems, scored.size());
        for (int i = 0; i < n; i++) {
            PropertyDTO p = scored.get(i).dto;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("type", typeName(p));
            m.put("neighborhood", p.getNeighborhood() != null ? p.getNeighborhood().getName() : "");
            m.put("address", (p.getStreet() != null ? p.getStreet() : "") + " " + (p.getNumber() != null ? p.getNumber() : ""));
            m.put("rooms", p.getRooms());
            m.put("bedrooms", p.getBedrooms());
            m.put("bathrooms", p.getBathrooms());
            m.put("operation", p.getOperation());
            m.put("currency", p.getCurrency());
            m.put("price", p.getPrice());
            if (p.getAmenities() != null) {
                m.put("amenities", p.getAmenities().stream().map(a -> a.getName().toLowerCase(Locale.ROOT)).toList());
            } else {
                m.put("amenities", List.of());
            }
            out.add(m);
        }
        return out;
    }

    private static String typeName(PropertyDTO p) {
        return p.getType() != null && p.getType().getName() != null ? p.getType().getName() : "";
    }

    private boolean isWasiAvailable(JsonNode n) {
        return "1".equals(text(n, "id_availability"));
    }

    private boolean matchesWasiSearch(JsonNode n,
            BigDecimal priceFrom, BigDecimal priceTo,
            float areaFrom, float areaTo,
            float coveredAreaFrom, float coveredAreaTo,
            List<Float> rooms, String operation, List<String> types,
            Currency currency, Status status,
            Integer garagesMin, String condition, Boolean forTransfer) {
        BigDecimal price = priceFrom.compareTo(BigDecimal.ZERO) > 0 || priceTo.compareTo(BigDecimal.ZERO) > 0
                ? resolveWasiPrice(n) : null;
        if (price != null) {
            if (priceFrom.compareTo(BigDecimal.ZERO) > 0 && price.compareTo(priceFrom) < 0) {
                return false;
            }
            if (priceTo.compareTo(BigDecimal.ZERO) > 0 && price.compareTo(priceTo) > 0) {
                return false;
            }
        }
        float area = parseFloat(n, "area");
        if (areaFrom > 0 && area < areaFrom) {
            return false;
        }
        if (areaTo > 0 && area > areaTo) {
            return false;
        }
        float cov = parseFloat(n, "built_area");
        if (coveredAreaFrom > 0 && cov < coveredAreaFrom) {
            return false;
        }
        if (coveredAreaTo > 0 && cov > coveredAreaTo) {
            return false;
        }
        if (rooms != null && !rooms.isEmpty()) {
            float br = parseFloat(n, "bedrooms");
            boolean any = false;
            for (Float r : rooms) {
                if (r != null && r > 0 && Math.abs(br - r) < 0.01f) {
                    any = true;
                    break;
                }
            }
            if (!any) {
                return false;
            }
        }
        if (operation != null && !operation.isBlank()) {
            boolean sale = "true".equalsIgnoreCase(text(n, "for_sale"));
            boolean rent = "true".equalsIgnoreCase(text(n, "for_rent"));
            String o = operation.toLowerCase(Locale.ROOT);
            if (o.contains("venta") && !sale) {
                return false;
            }
            if (o.contains("alquiler") && !rent) {
                return false;
            }
        }
        if (currency != null) {
            String iso = text(n, "iso_currency");
            if (!iso.isEmpty() && !currency.name().equalsIgnoreCase(iso)) {
                return false;
            }
        }
        if (status != null) {
            String av = text(n, "id_availability");
            boolean ok = switch (status) {
                case DISPONIBLE -> "1".equals(av);
                case VENDIDA -> "2".equals(av);
                case ALQUILADA -> "3".equals(av);
                default -> true;
            };
            if (!ok) {
                return false;
            }
        }
        if (garagesMin != null && garagesMin > 0) {
            int g = wasiIntField(n, "garages", 0);
            if (g < garagesMin) {
                return false;
            }
        }
        if (condition != null && !condition.isBlank()) {
            String c = condition.toLowerCase(Locale.ROOT);
            int cid = wasiIntField(n, "id_property_condition", -1);
            if (c.contains("nueva") && cid != 1) {
                return false;
            }
            if (c.contains("usada") && cid != 2) {
                return false;
            }
        }
        if (Boolean.TRUE.equals(forTransfer)) {
            if (!"true".equalsIgnoreCase(text(n, "for_transfer"))) {
                return false;
            }
        }
        if (types != null && !types.isEmpty()) {
            String label = text(n, "property_type_label").toLowerCase(Locale.ROOT);
            if (!label.isEmpty()) {
                boolean match = types.stream().anyMatch(t -> label.contains(t.toLowerCase(Locale.ROOT)));
                if (!match) {
                    return false;
                }
            }
        }
        return true;
    }

    private BigDecimal resolveWasiPrice(JsonNode n) {
        boolean sale = "true".equalsIgnoreCase(text(n, "for_sale"));
        String key = sale ? "sale_price" : "rent_price";
        String t = text(n, key);
        if (t.isBlank()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(t.replace(",", "."));
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private static float parseFloat(JsonNode n, String field) {
        String t = text(n, field);
        if (t.isBlank()) {
            return 0f;
        }
        try {
            return Float.parseFloat(t.replace(",", "."));
        } catch (NumberFormatException e) {
            return 0f;
        }
    }

    private static int wasiIntField(JsonNode n, String field, int def) {
        String t = text(n, field);
        if (t.isBlank()) {
            return def;
        }
        try {
            return Integer.parseInt(t.split("\\.")[0]);
        } catch (NumberFormatException e) {
            return def;
        }
    }

    private static String text(JsonNode n, String field) {
        if (n == null || !n.has(field)) {
            return "";
        }
        return n.get(field).asText("");
    }

    private List<PropertyDTO> fetchWasiDtosExcludingLinked(boolean admin, java.util.function.Predicate<JsonNode> filter) {
        if (!wasiApiProperties.isConfigured()) {
            return List.of();
        }
        Set<Integer> linked = syncRepository.findAll().stream()
                .filter(s -> s.getProperty() != null)
                .map(WasiPropertySync::getWasiPropertyId)
                .collect(Collectors.toSet());
        List<PropertyDTO> list = new ArrayList<>();
        for (JsonNode n : wasiPropertyListCache.getOrLoadAll()) {
            int wid = n.path("id_property").asInt(0);
            if (wid == 0 || linked.contains(wid)) {
                continue;
            }
            if (!filter.test(n)) {
                continue;
            }
            list.add(wasiMapper.fromWasiProperty(n, admin));
        }
        return list;
    }

    private PropertyDTO decorateLocal(PropertyDTO d, boolean admin) {
        if (!admin) {
            return d;
        }
        d.setSource("propia");
        syncRepository.findByProperty_Id(d.getId()).ifPresent(s -> {
            d.setWasiId(s.getWasiPropertyId());
            if (s.getSyncPortalsJson() != null && !s.getSyncPortalsJson().isBlank()) {
                try {
                    List<Integer> ids = objectMapper.readValue(s.getSyncPortalsJson(), new TypeReference<>() {});
                    d.setWasiPortals(ids.stream().map(String::valueOf).toList());
                } catch (Exception ignored) {
                    d.setWasiPortals(List.of());
                }
            }
        });
        return d;
    }

    private void stripAdmin(PropertyDTO d) {
        d.setSource(null);
        d.setWasiId(null);
        d.setWasiPortals(null);
    }

    private List<PropertyDTO> applySourceFilter(List<PropertyDTO> list, String source, boolean admin) {
        if (!admin || source == null || source.isBlank()
                || "all".equalsIgnoreCase(source) || "todas".equalsIgnoreCase(source)) {
            return list;
        }
        if ("propia".equalsIgnoreCase(source)) {
            return list.stream()
                    .filter(d -> d.getSource() == null || "propia".equalsIgnoreCase(d.getSource()))
                    .toList();
        }
        return list.stream()
                .filter(d -> source.equalsIgnoreCase(d.getSource()))
                .toList();
    }

    public PropertySimpleDTO toSimpleFromWasi(PropertyDTO p) {
        PropertySimpleDTO s = new PropertySimpleDTO();
        s.setId(p.getId());
        s.setTitle(p.getTitle());
        s.setPrice(p.getPrice());
        s.setDescription(p.getDescription());
        s.setDate(p.getDate());
        s.setMainImage(p.getMainImage());
        s.setStatus(p.getStatus());
        s.setOperation(p.getOperation());
        s.setCurrency(p.getCurrency());
        s.setNeighborhood(p.getNeighborhood() != null ? p.getNeighborhood().getName() : "");
        s.setType(typeName(p));
        s.setSource(p.getSource());
        s.setWasiId(p.getWasiId());
        return s;
    }
}
