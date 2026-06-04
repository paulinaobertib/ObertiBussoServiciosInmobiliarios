package pi.ms_properties.wasi;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import pi.ms_properties.domain.Owner;
import pi.ms_properties.domain.WasiOwnerSync;
import pi.ms_properties.repository.IWasiOwnerSyncRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

/**
 * Sync local {@link Owner} to Wasi as client type Propietario
 * (id_client_type configurable vía wasi.defaults.client-type-owner, default 5).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WasiClientService {

    private final WasiApiClient wasiApiClient;
    private final WasiApiProperties wasiApiProperties;
    private final WasiDefaultsProperties wasiDefaultsProperties;
    private final IWasiOwnerSyncRepository ownerSyncRepository;

    @Transactional
    public void syncOwnerToWasi(Owner owner) {
        if (!wasiApiProperties.isConfigured() || owner == null || owner.getId() == null) {
            return;
        }
        if (ownerSyncRepository.findByOwner_Id(owner.getId()).isPresent()) {
            return;
        }
        try {
            JsonNode search = wasiApiClient.searchClients(Map.of(
                    "email", owner.getEmail(),
                    "take", "20"
            ));
            if (WasiJsonUtil.isSuccess(search)) {
                for (JsonNode node : WasiJsonUtil.indexedItems(search)) {
                    String mail = node.path("email").asText("");
                    if (owner.getEmail() != null && owner.getEmail().equalsIgnoreCase(mail)) {
                        Integer cid = WasiJsonUtil.extractClientId(node);
                        if (cid != null) {
                            saveOwnerSync(owner, cid);
                            return;
                        }
                    }
                }
            }
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("first_name", nullSafe(owner.getFirstName()));
            form.add("last_name", nullSafe(owner.getLastName()));
            form.add("email", nullSafe(owner.getEmail()));
            form.add("phone", nullSafe(owner.getPhone()));
            form.add("id_client_type", String.valueOf(wasiDefaultsProperties.getClientTypeOwner()));
            JsonNode resp = wasiApiClient.addClient(form);
            if (!WasiJsonUtil.isSuccess(resp)) {
                log.warn("Wasi client/add owner non-success: {}", resp);
                return;
            }
            Integer cid = WasiJsonUtil.extractClientId(resp);
            if (cid == null) {
                cid = WasiJsonUtil.extractPropertyId(resp);
            }
            if (cid != null) {
                saveOwnerSync(owner, cid);
            }
        } catch (Exception e) {
            log.warn("Wasi owner sync failed: {}", e.getMessage());
        }
    }

    private void saveOwnerSync(Owner owner, int wasiClientId) {
        WasiOwnerSync row = WasiOwnerSync.builder()
                .owner(owner)
                .wasiClientId(wasiClientId)
                .syncedAt(LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")))
                .build();
        ownerSyncRepository.save(row);
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }
}
