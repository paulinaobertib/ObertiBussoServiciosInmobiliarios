package pi.ms_users.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import pi.ms_users.domain.User;
import pi.ms_users.domain.WasiTenantSync;
import pi.ms_users.repository.WasiTenantSyncRepository;
import pi.ms_users.wasi.UsersWasiApiClient;
import pi.ms_users.wasi.WasiApiProperties;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WasiTenantSyncService {

    private final WasiApiProperties wasiApiProperties;
    private final UsersWasiApiClient wasiApiClient;
    private final WasiTenantSyncRepository tenantSyncRepository;

    @Transactional
    public void syncTenantToWasi(User user) {
        if (!wasiApiProperties.isConfigured() || user == null || user.getId() == null) {
            return;
        }
        if (tenantSyncRepository.findByUserId(user.getId()).isPresent()) {
            return;
        }
        try {
            JsonNode search = wasiApiClient.searchClients(Map.of("email", nullSafe(user.getEmail()), "take", "30"));
            if (isSuccess(search)) {
                for (JsonNode node : indexedItems(search)) {
                    String mail = node.path("email").asText("");
                    if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(mail)) {
                        Integer cid = extractClientId(node);
                        if (cid != null) {
                            save(user.getId(), cid);
                            return;
                        }
                    }
                }
            }
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("first_name", nullSafe(user.getFirstName()));
            form.add("last_name", nullSafe(user.getLastName()));
            form.add("email", nullSafe(user.getEmail()));
            form.add("phone", nullSafe(user.getPhone()));
            form.add("id_client_type", String.valueOf(wasiApiProperties.getIdClientTypeTenant()));
            JsonNode resp = wasiApiClient.addClient(form);
            if (!isSuccess(resp)) {
                log.warn("Wasi tenant add non-success: {}", resp);
                return;
            }
            Integer cid = extractClientId(resp);
            if (cid != null) {
                save(user.getId(), cid);
            }
        } catch (Exception e) {
            log.warn("Wasi tenant sync: {}", e.getMessage());
        }
    }

    private void save(String userId, int wasiClientId) {
        WasiTenantSync row = WasiTenantSync.builder()
                .userId(userId)
                .wasiClientId(wasiClientId)
                .syncedAt(LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")))
                .build();
        tenantSyncRepository.save(row);
    }

    private static boolean isSuccess(JsonNode root) {
        return root != null && root.has("status") && "success".equalsIgnoreCase(root.get("status").asText());
    }

    private static List<JsonNode> indexedItems(JsonNode root) {
        List<Map.Entry<String, JsonNode>> entries = new ArrayList<>();
        root.fields().forEachRemaining(e -> {
            if (e.getKey().matches("\\d+")) {
                entries.add(e);
            }
        });
        entries.sort(Comparator.comparingInt(a -> Integer.parseInt(a.getKey())));
        return entries.stream().map(Map.Entry::getValue).toList();
    }

    private static Integer extractClientId(JsonNode root) {
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

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }
}
