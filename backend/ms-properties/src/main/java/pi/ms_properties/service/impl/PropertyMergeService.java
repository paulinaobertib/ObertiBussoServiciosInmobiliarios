package pi.ms_properties.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pi.ms_properties.domain.Currency;
import pi.ms_properties.domain.HiddenProperty;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.Status;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.domain.WasiPropertySync;
import pi.ms_properties.repository.IHiddenPropertyRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.IWasiPropertySyncRepository;
import pi.ms_properties.security.SecurityUtils;
import pi.ms_properties.service.interf.IPropertyService;
import pi.ms_properties.specification.PropertySpecification;
import pi.ms_properties.wasi.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
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
    private final IHiddenPropertyRepository hiddenPropertyRepository;
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
        locals = applyVisibility(locals, admin);
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
        locals = applyVisibility(locals, admin);
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
                        rooms, operation, types, amenities, cities, neighborhoods, neighborhoodTypes,
                        credit, financing, currency, status, garagesMin, condition, forTransfer)));

        locals = applySourceFilter(locals, source, admin);
        locals = applyVisibility(locals, admin);
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
        locals = applyVisibility(locals, admin);
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
            List<String> amenities, List<String> cities, List<String> neighborhoods, List<String> neighborhoodTypes,
            Boolean credit, Boolean financing,
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
            // Wasi NO devuelve un label de tipo en /property/search, solo el id numérico
            // (id_property_type). Se compara contra el id que mapea cada nombre pedido.
            int wid = wasiIntField(n, "id_property_type", -1);
            boolean match = types.stream()
                    .map(wasiMapper::typeIdFor)
                    .anyMatch(id -> id > 0 && id == wid);
            if (!match) {
                return false;
            }
        }
        if (cities != null && !cities.isEmpty()) {
            String city = text(n, "city_label").toLowerCase(Locale.ROOT);
            boolean match = !city.isEmpty() && cities.stream()
                    .filter(c -> c != null && !c.isBlank())
                    .map(c -> c.toLowerCase(Locale.ROOT))
                    .anyMatch(c -> city.contains(c) || c.contains(city));
            if (!match) {
                return false;
            }
        }
        if (neighborhoods != null && !neighborhoods.isEmpty()) {
            // Wasi no tiene "barrio" como tal: se aproxima con zone/location/city.
            String hay = (text(n, "zone_label") + " " + text(n, "location_label") + " " + text(n, "city_label"))
                    .toLowerCase(Locale.ROOT);
            boolean match = neighborhoods.stream()
                    .anyMatch(b -> b != null && !b.isBlank() && hay.contains(b.toLowerCase(Locale.ROOT)));
            if (!match) {
                return false;
            }
        }
        if (amenities != null && !amenities.isEmpty()) {
            Set<String> feats = wasiFeatureNames(n);
            boolean match = !feats.isEmpty() && amenities.stream()
                    .filter(a -> a != null && !a.isBlank())
                    .map(a -> a.toLowerCase(Locale.ROOT))
                    .anyMatch(a -> feats.stream().anyMatch(f -> f.contains(a)));
            if (!match) {
                return false;
            }
        }
        // Datos que Wasi no expone en /property/search: si el usuario filtra explícitamente por
        // crédito/financiación o por tipo de barrio, las de Wasi no se pueden verificar -> se excluyen.
        // (credit/financing == false sí matchea: una propiedad de Wasi no tiene crédito/financiación).
        if (Boolean.TRUE.equals(credit) || Boolean.TRUE.equals(financing)) {
            return false;
        }
        if (neighborhoodTypes != null && !neighborhoodTypes.isEmpty()) {
            return false;
        }
        return true;
    }

    /** Nombres de las características (features.internal/external) de una propiedad de Wasi, en minúscula. */
    private static Set<String> wasiFeatureNames(JsonNode n) {
        Set<String> out = new HashSet<>();
        JsonNode features = n.get("features");
        if (features == null) {
            return out;
        }
        for (String group : new String[]{"internal", "external"}) {
            for (JsonNode it : asNodeList(features.get(group))) {
                String name = it.path("nombre").asText("");
                if (name.isEmpty()) {
                    name = it.path("name").asText("");
                }
                if (!name.isEmpty()) {
                    out.add(name.toLowerCase(Locale.ROOT));
                }
            }
        }
        return out;
    }

    /** Normaliza un nodo de Wasi que puede venir como array JSON o como objeto con claves numéricas. */
    private static List<JsonNode> asNodeList(JsonNode node) {
        if (node == null) {
            return List.of();
        }
        if (node.isArray()) {
            List<JsonNode> out = new ArrayList<>();
            node.forEach(out::add);
            return out;
        }
        if (node.isObject()) {
            return WasiJsonUtil.indexedItems(node);
        }
        return List.of();
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

    /**
     * Visibilidad pública (toggle de admin). Funciona igual para locales y Wasi porque la clave es
     * el id público del DTO (sintético para Wasi). Para no-admin: filtra las ocultas. Para admin:
     * las deja todas y marca el flag {@code visible} para que el toggle refleje el estado.
     */
    private List<PropertyDTO> applyVisibility(List<PropertyDTO> list, boolean admin) {
        Set<Long> hidden = hiddenPropertyRepository.findAllHiddenIds();
        if (admin) {
            list.forEach(d -> d.setVisible(d.getId() == null || !hidden.contains(d.getId())));
            return list;
        }
        if (hidden.isEmpty()) {
            return list;
        }
        return list.stream()
                .filter(d -> d.getId() == null || !hidden.contains(d.getId()))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    /** True si la propiedad (local o Wasi, por id público) está oculta para el público. */
    public boolean isHidden(Long id) {
        return id != null && hiddenPropertyRepository.existsById(id);
    }

    /** Marca/desmarca una propiedad como visible para el público. Idempotente. Solo admin (controller). */
    public ResponseEntity<String> setVisibility(Long id, boolean visible) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Se requiere el id de la propiedad.");
        }
        boolean currentlyHidden = hiddenPropertyRepository.existsById(id);
        if (visible && currentlyHidden) {
            hiddenPropertyRepository.deleteById(id);
        } else if (!visible && !currentlyHidden) {
            hiddenPropertyRepository.save(new HiddenProperty(id));
        }
        return ResponseEntity.ok(visible
                ? "La propiedad se muestra en la página."
                : "La propiedad se ocultó de la página (el admin la sigue viendo).");
    }

    /**
     * Opciones del filtro de origen: "propia" + cada inmobiliaria aliada distinta ("Aliada - &lt;nombre&gt;"),
     * derivadas de la lista de Wasi cacheada. Así el filtro permite elegir una aliada puntual.
     */
    public List<String> originOptions() {
        List<String> out = new ArrayList<>();
        out.add("propia");
        if (!wasiApiProperties.isConfigured()) {
            return out;
        }
        Set<String> allied = new HashSet<>();
        try {
            for (JsonNode n : wasiPropertyListCache.getOrLoadAll()) {
                String src = wasiMapper.sourceOf(n);
                if (src != null && !"propia".equalsIgnoreCase(src)) {
                    allied.add(src);
                }
            }
        } catch (Exception ignored) {
            // ante un fallo, devolvemos al menos "propia"
        }
        List<String> sorted = new ArrayList<>(allied);
        sorted.sort(String.CASE_INSENSITIVE_ORDER);
        out.addAll(sorted);
        return out;
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
