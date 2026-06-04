package pi.ms_properties.wasi;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import pi.ms_properties.domain.*;
import pi.ms_properties.dto.NeighborhoodDTO;
import pi.ms_properties.dto.PropertyDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class WasiMapper {

    public static final long SYNTHETIC_ID_BASE = 1_000_000_000L;

    private final WasiApiProperties wasiApiProperties;
    private final WasiDefaultsProperties wasiDefaultsProperties;

    public MultiValueMap<String, String> propertyToWasiForm(Property property, WasiLocationMapping loc, List<Integer> portalIds) {
        MultiValueMap<String, String> m = new LinkedMultiValueMap<>();
        m.add("title", nullSafe(property.getTitle()));
        m.add("id_country", String.valueOf(loc.getWasiCountryId()));
        m.add("id_region", String.valueOf(loc.getWasiRegionId()));
        m.add("id_city", String.valueOf(loc.getWasiCityId()));
        if (loc.getWasiLocationId() != null) {
            m.add("id_location", String.valueOf(loc.getWasiLocationId()));
        }
        if (loc.getWasiZoneId() != null) {
            m.add("id_zone", String.valueOf(loc.getWasiZoneId()));
        }

        if (property.getOperation() == Operation.VENTA) {
            m.add("for_sale", "true");
            m.add("for_rent", "false");
        } else {
            m.add("for_sale", "false");
            m.add("for_rent", "true");
        }
        m.add("for_transfer", "false");

        if (property.getOperation() == Operation.VENTA) {
            m.add("sale_price", property.getPrice() != null ? property.getPrice().toPlainString() : "0");
            m.add("rent_price", "0");
        } else {
            m.add("rent_price", property.getPrice() != null ? property.getPrice().toPlainString() : "0");
            m.add("sale_price", "0");
        }

        m.add("id_currency", String.valueOf(currencyToWasiId(property.getCurrency())));
        m.add("observations", nullSafe(property.getDescription()));

        String address = (nullSafe(property.getStreet()) + " " + nullSafe(property.getNumber())).trim();
        m.add("address", address.isEmpty() ? "-" : address);

        if (property.getLatitude() != null) {
            m.add("latitude", String.valueOf(property.getLatitude()));
        }
        if (property.getLongitude() != null) {
            m.add("longitude", String.valueOf(property.getLongitude()));
        }

        m.add("area", property.getArea() != null ? String.valueOf(property.getArea().intValue()) : "0");
        m.add("built_area", property.getCoveredArea() != null ? String.valueOf(property.getCoveredArea().intValue()) : "0");
        if (property.getPrivateArea() != null) {
            m.add("private_area", String.valueOf(property.getPrivateArea().intValue()));
        }

        if (property.getExpenses() != null) {
            m.add("maintenance_fee", property.getExpenses().toPlainString());
        }

        m.add("bedrooms", String.valueOf(property.getBedrooms() != null ? property.getBedrooms().intValue() : 0));
        m.add("bathrooms", String.valueOf(property.getBathrooms() != null ? property.getBathrooms().intValue() : 0));
        m.add("garages", String.valueOf(Optional.ofNullable(property.getGarages()).orElse(0)));
        if (property.getFloor() != null) {
            m.add("floor", String.valueOf(property.getFloor()));
        }
        if (property.getVideo() != null && !property.getVideo().isBlank()) {
            m.add("video", property.getVideo());
        }
        if (property.getZipCode() != null && !property.getZipCode().isBlank()) {
            m.add("zip_code", property.getZipCode());
        }

        PropertyCondition cond = property.getPropertyCondition() != null ? property.getPropertyCondition() : PropertyCondition.USADA;
        m.add("id_property_condition", String.valueOf(cond.getWasiId()));

        m.add("id_status_on_page", Boolean.TRUE.equals(property.getOutstanding()) ? "3" : "1");
        m.add("id_availability", String.valueOf(statusToWasiAvailability(property.getStatus())));
        m.add("id_publish_on_map",
                (property.getLatitude() != null && property.getLongitude() != null) ? "3" : "1");

        if (wasiApiProperties.getDefaultUserId() != null) {
            m.add("id_user", String.valueOf(wasiApiProperties.getDefaultUserId()));
        }

        if (property.getRentsType() != null && property.getOperation() == Operation.ALQUILER) {
            m.add("id_rents_type", String.valueOf(property.getRentsType().getWasiId()));
        } else if (property.getOperation() == Operation.ALQUILER) {
            m.add("id_rents_type", "4");
        }

        m.add("network_share", Boolean.TRUE.equals(property.getNetworkShare()) ? "true" : "false");

        String typeName = (property.getType() != null) ? property.getType().getName() : null;
        m.add("id_property_type", String.valueOf(guessWasiPropertyTypeId(typeName)));

        if (property.getId() != null) {
            m.add("reference", String.valueOf(property.getId()));
        }

        // Portales seleccionados por el admin. Wasi espera el array portals[].
        // Si no se envía ninguno: en create publica en TODOS los portales activos;
        // en update preserva los existentes.
        if (portalIds != null) {
            for (Integer pid : portalIds) {
                if (pid != null) {
                    m.add("portals[]", String.valueOf(pid));
                }
            }
        }

        return m;
    }

    private static int statusToWasiAvailability(Status s) {
        if (s == null) {
            return 1;
        }
        return switch (s) {
            case VENDIDA -> 2;
            case ALQUILADA -> 3;
            default -> 1;
        };
    }

    private int currencyToWasiId(Currency c) {
        if (c == Currency.USD) {
            return wasiDefaultsProperties.getCurrencyUsd();
        }
        return wasiDefaultsProperties.getCurrencyArs();
    }

    /**
     * Mapeo del nombre del tipo local al id_property_type de Wasi (tabla 1-32, sin 9; ver
     * https://api.wasi.co/docs/en/guide/fields/property-types.html). Es un heurístico por
     * palabras clave: las reglas más específicas van primero (p. ej. "campo" antes que "casa",
     * para que "casa de campo" -> 31 y no 1). Cuando ningún nombre matchea se usa un id por
     * defecto configurable y se loguea un WARN para detectar tipos sin mapear.
     */
    private int guessWasiPropertyTypeId(String typeName) {
        if (typeName == null || typeName.isBlank()) {
            return defaultPropertyTypeId("(vacío)");
        }
        String n = typeName.toLowerCase();
        // Campo / quinta / chacra ANTES que "casa" para no capturar "casa de campo" como Casa.
        if (n.contains("quinta") || n.contains("chacra") || n.contains("campo")) {
            return 31; // Fields, Chacras and Quintas
        }
        if (n.contains("monoambiente") || n.contains("estudio") || n.contains("studio")) {
            return 14; // Studio apartment
        }
        if (n.contains("departamento") || n.contains("depto") || n.contains("apart")) {
            return 2; // Apartment
        }
        if (n.contains("duplex") || n.contains("dúplex")) {
            return 20; // Duplex
        }
        if (n.contains("penthouse") || n.contains("pent")) {
            return 21; // Penthouse
        }
        if (n.contains("edificio")) {
            return 16; // Building
        }
        if (n.contains("oficina")) {
            return 4; // Office
        }
        if (n.contains("consultorio")) {
            return 15; // Consulting room
        }
        if (n.contains("local") || n.contains("comercial")) {
            return 3; // Local
        }
        if (n.contains("cochera") || n.contains("garage") || n.contains("garaje")) {
            return 26; // Parking garage
        }
        if (n.contains("nave")) {
            return 30; // Industrial Warehouse
        }
        if (n.contains("galp") || n.contains("deposito") || n.contains("depósito") || n.contains("bodega")) {
            return 8; // Warehouses
        }
        if (n.contains("cabaña") || n.contains("cabana")) {
            return 28; // Cottage
        }
        if (n.contains("chalet")) {
            return 10; // Chalet
        }
        if (n.contains("bungalow")) {
            return 22; // Bungalow
        }
        if (n.contains("condominio") || n.contains("condo")) {
            return 19; // Condo
        }
        if (n.contains("hotel")) {
            return 12; // Hotels
        }
        if (n.contains("finca")) {
            return 7; // Estate
        }
        if (n.contains("lote") || n.contains("loteo")) {
            return 32; // Land
        }
        if (n.contains("terreno")) {
            return 5; // Terrain / Ground
        }
        if (n.contains("casa")) {
            return 1; // House
        }
        return defaultPropertyTypeId(typeName);
    }

    private int defaultPropertyTypeId(String typeName) {
        int def = wasiDefaultsProperties.getPropertyTypeDefaultId();
        log.warn("Wasi: tipo de propiedad '{}' sin mapeo a id_property_type; se usa el default {}. "
                + "Revisar guessWasiPropertyTypeId o la tabla de tipos de Wasi.", typeName, def);
        return def;
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    public PropertyDTO fromWasiProperty(JsonNode n, boolean adminFields) {
        PropertyDTO dto = new PropertyDTO();
        int wasiId = n.path("id_property").asInt(0);
        long syntheticId = SYNTHETIC_ID_BASE + wasiId;
        dto.setId(syntheticId);
        dto.setTitle(text(n, "title"));
        dto.setStreet(text(n, "address"));
        dto.setNumber("");
        dto.setLatitude(parseDouble(n, "latitude"));
        dto.setLongitude(parseDouble(n, "longitude"));
        dto.setRooms(parseFloat(n, "bedrooms"));
        dto.setBathrooms(parseFloat(n, "bathrooms"));
        dto.setBedrooms(parseFloat(n, "bedrooms"));
        dto.setGarages(parseIntObj(n, "garages"));
        dto.setFloor(parseIntObj(n, "floor"));
        dto.setArea(parseFloat(n, "area"));
        dto.setCoveredArea(parseFloat(n, "built_area"));
        dto.setPrivateArea(parseFloat(n, "private_area"));
        dto.setPrice(resolvePrice(n));
        dto.setShowPrice(true);
        dto.setExpenses(parseBigDecimal(n, "maintenance_fee"));
        dto.setShowExpenses(dto.getExpenses() != null);
        dto.setCredit(false);
        dto.setFinancing(false);
        dto.setOutstanding("3".equals(text(n, "id_status_on_page")));
        dto.setDescription(text(n, "observations"));
        dto.setVideo(text(n, "video"));
        dto.setZipCode(text(n, "zip_code"));
        dto.setDate(parseWasiDate(n.path("created_at").asText(null)));
        dto.setMainImage(extractMainImageUrl(n));
        dto.setStatus(mapAvailabilityToStatus(n.path("id_availability").asText("1")));
        dto.setOperation(resolveOperation(n));
        dto.setCurrency(mapCurrency(text(n, "iso_currency")));
        if (n.has("id_property_condition") && !n.get("id_property_condition").asText("").isBlank()) {
            try {
                int cid = Integer.parseInt(n.get("id_property_condition").asText());
                dto.setPropertyCondition(PropertyCondition.fromWasiId(cid).name());
            } catch (NumberFormatException ignored) {
                dto.setPropertyCondition(null);
            }
        }
        if (n.has("id_rents_type") && !n.get("id_rents_type").asText("").isBlank()) {
            try {
                int rid = Integer.parseInt(n.get("id_rents_type").asText());
                dto.setRentsType(RentsType.fromWasiId(rid).name());
            } catch (NumberFormatException ignored) {
                dto.setRentsType(null);
            }
        }
        dto.setNetworkShare(n.path("network_share").asBoolean(false));

        NeighborhoodDTO nb = new NeighborhoodDTO();
        nb.setId(null);
        nb.setName(text(n, "city_label"));
        nb.setCity(text(n, "city_label"));
        nb.setType("");
        dto.setNeighborhood(nb);

        Type t = new Type();
        t.setId(0L);
        t.setName("Wasi");
        t.setHasRooms(true);
        t.setHasBathrooms(true);
        t.setHasBedrooms(true);
        t.setHasCoveredArea(true);
        dto.setType(t);

        dto.setAmenities(new HashSet<>());
        dto.setImages(new HashSet<>());

        if (adminFields) {
            dto.setWasiId(wasiId);
            String owner = text(n, "owner");
            if ("allied".equalsIgnoreCase(owner)) {
                dto.setSource("Aliada");
            } else {
                dto.setSource("propia");
            }
        }
        return dto;
    }

    private static String extractMainImageUrl(JsonNode n) {
        JsonNode mi = n.get("main_image");
        if (mi != null && mi.isObject()) {
            String u = mi.path("url_big").asText("");
            if (!u.isEmpty()) {
                return u;
            }
            return mi.path("url").asText("");
        }
        return "";
    }

    private static LocalDateTime parseWasiDate(String s) {
        if (s == null || s.isBlank()) {
            return LocalDateTime.now();
        }
        for (String fmt : new String[]{"yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd"}) {
            try {
                if (fmt.contains("HH")) {
                    return LocalDateTime.parse(s, DateTimeFormatter.ofPattern(fmt));
                }
                return java.time.LocalDate.parse(s, DateTimeFormatter.ofPattern(fmt)).atStartOfDay();
            } catch (DateTimeParseException ignored) {
            }
        }
        return LocalDateTime.now();
    }

    private static String mapAvailabilityToStatus(String idAvail) {
        return switch (idAvail) {
            case "2" -> Status.VENDIDA.name();
            case "3" -> Status.ALQUILADA.name();
            default -> Status.DISPONIBLE.name();
        };
    }

    private static String resolveOperation(JsonNode n) {
        boolean sale = "true".equalsIgnoreCase(n.path("for_sale").asText());
        boolean rent = "true".equalsIgnoreCase(n.path("for_rent").asText());
        if (sale && !rent) {
            return Operation.VENTA.name();
        }
        if (rent && !sale) {
            return Operation.ALQUILER.name();
        }
        BigDecimal sp = parseBigDecimal(n, "sale_price");
        BigDecimal rp = parseBigDecimal(n, "rent_price");
        if (sp != null && sp.compareTo(BigDecimal.ZERO) > 0 && (rp == null || rp.compareTo(BigDecimal.ZERO) == 0)) {
            return Operation.VENTA.name();
        }
        return Operation.ALQUILER.name();
    }

    private static BigDecimal resolvePrice(JsonNode n) {
        String op = resolveOperation(n);
        if (Operation.VENTA.name().equals(op)) {
            return Optional.ofNullable(parseBigDecimal(n, "sale_price")).orElse(BigDecimal.ZERO);
        }
        return Optional.ofNullable(parseBigDecimal(n, "rent_price")).orElse(BigDecimal.ZERO);
    }

    private static String mapCurrency(String iso) {
        if (iso == null || iso.isBlank()) {
            return Currency.ARS.name();
        }
        if (iso.equalsIgnoreCase("USD")) {
            return Currency.USD.name();
        }
        return Currency.ARS.name();
    }

    private static String text(JsonNode n, String field) {
        if (!n.has(field)) {
            return "";
        }
        return n.get(field).asText("");
    }

    private static Double parseDouble(JsonNode n, String field) {
        String t = text(n, field);
        if (t.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(t.replace(",", "."));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Float parseFloat(JsonNode n, String field) {
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

    private static Integer parseIntObj(JsonNode n, String field) {
        String t = text(n, field);
        if (t.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(t.split("\\.")[0]);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static BigDecimal parseBigDecimal(JsonNode n, String field) {
        String t = text(n, field);
        if (t.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(t.replace(",", "."));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
