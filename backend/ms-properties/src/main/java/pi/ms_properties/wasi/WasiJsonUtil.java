package pi.ms_properties.wasi;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

public final class WasiJsonUtil {

    private WasiJsonUtil() {
    }

    public static boolean isSuccess(JsonNode root) {
        if (root == null || !root.has("status")) {
            return false;
        }
        return "success".equalsIgnoreCase(root.get("status").asText());
    }

    /**
     * Wasi returns list-like objects with keys "0","1",... plus "status","total".
     */
    /**
     * Best-effort parse of id_property from Wasi add/update responses.
     */
    public static Integer extractPropertyId(JsonNode root) {
        if (root == null) {
            return null;
        }
        JsonNode v = root.get("id_property");
        if (v != null && !v.isNull()) {
            if (v.isInt() || v.isLong()) {
                return v.asInt();
            }
            if (v.isTextual()) {
                try {
                    return Integer.parseInt(v.asText().trim());
                } catch (NumberFormatException ignored) {
                    return null;
                }
            }
        }
        JsonNode inner = root.get("property");
        if (inner != null && inner.isObject()) {
            return extractPropertyId(inner);
        }
        return null;
    }

    public static Integer extractClientId(JsonNode root) {
        if (root == null) {
            return null;
        }
        for (String key : new String[] {"id_client", "id", "client_id"}) {
            JsonNode v = root.get(key);
            if (v != null && !v.isNull()) {
                if (v.isInt() || v.isLong()) {
                    return v.asInt();
                }
                if (v.isTextual()) {
                    try {
                        return Integer.parseInt(v.asText().trim());
                    } catch (NumberFormatException ignored) {
                        // continue
                    }
                }
            }
        }
        return null;
    }

    public static List<JsonNode> indexedItems(JsonNode root) {
        List<Map.Entry<String, JsonNode>> entries = new ArrayList<>();
        root.fields().forEachRemaining(e -> {
            if (e.getKey().matches("\\d+")) {
                entries.add(e);
            }
        });
        entries.sort(Comparator.comparingInt(a -> Integer.parseInt(a.getKey())));
        return entries.stream().map(Map.Entry::getValue).toList();
    }
}
