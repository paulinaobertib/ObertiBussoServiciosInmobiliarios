package pi.ms_properties.wasi;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.WasiLocationMapping;
import pi.ms_properties.domain.WasiPropertySync;
import pi.ms_properties.dto.PropertySaveDTO;
import pi.ms_properties.dto.PropertyUpdateDTO;
import pi.ms_properties.dto.wasi.WasiActivityEntryDTO;
import pi.ms_properties.dto.wasi.WasiSyncStatusDTO;
import pi.ms_properties.repository.IImageRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.IWasiLocationMappingRepository;
import pi.ms_properties.repository.IWasiPropertySyncRepository;
import pi.ms_properties.service.interf.IAzureBlobStorage;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WasiPropertySyncService {

    private static final int MAX_ACTIVITY = 200;
    private static final Deque<WasiActivityEntryDTO> ACTIVITY = new ArrayDeque<>();

    private final WasiApiClient wasiApiClient;
    private final WasiMapper wasiMapper;
    private final WasiApiProperties wasiApiProperties;
    private final IWasiPropertySyncRepository syncRepository;
    private final IWasiLocationMappingRepository locationMappingRepository;
    private final IPropertyRepository propertyRepository;
    private final IAzureBlobStorage azureBlobStorage;
    private final IImageRepository imageRepository;
    private final ObjectMapper objectMapper;
    private final WasiPropertyListCache wasiPropertyListCache;

    public static List<WasiActivityEntryDTO> recentActivity() {
        synchronized (ACTIVITY) {
            return new ArrayList<>(ACTIVITY);
        }
    }

    private void activity(String level, String message) {
        WasiActivityEntryDTO e = new WasiActivityEntryDTO(Instant.now(), level, message);
        synchronized (ACTIVITY) {
            ACTIVITY.addFirst(e);
            while (ACTIVITY.size() > MAX_ACTIVITY) {
                ACTIVITY.removeLast();
            }
        }
    }

    public Optional<WasiSyncStatusDTO> getSyncStatus(Long propertyId) {
        return syncRepository.findByProperty_Id(propertyId).map(s -> {
            List<Integer> portals = parsePortalIds(s.getSyncPortalsJson());
            return WasiSyncStatusDTO.builder()
                    .synced(true)
                    .wasiId(s.getWasiPropertyId())
                    .syncedAt(s.getSyncedAt())
                    .portalIds(portals)
                    .build();
        });
    }

    private List<Integer> parsePortalIds(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    @Transactional
    public void syncAfterLocalCreate(PropertySaveDTO saveDto, Long propertyId) {
        if (!wasiApiProperties.isConfigured()) {
            return;
        }
        if (!Boolean.TRUE.equals(saveDto.getPublishToWasi())) {
            return;
        }
        Property property = propertyRepository.findById(propertyId)
                .orElse(null);
        if (property == null) {
            return;
        }
        WasiLocationMapping loc = locationMappingRepository
                .findByNeighborhood_Id(property.getNeighborhood().getId())
                .orElse(null);
        if (loc == null) {
            activity("WARN", "Wasi: barrio sin mapeo (propertyId=" + propertyId + ")");
            log.warn("Wasi sync skipped: no location mapping for neighborhood {}", property.getNeighborhood().getId());
            return;
        }
        try {
            MultiValueMap<String, String> form = wasiMapper.propertyToWasiForm(property, loc, saveDto.getWasiPortalIds());
            JsonNode resp = wasiApiClient.addProperty(form);
            if (!WasiJsonUtil.isSuccess(resp)) {
                activity("ERROR", "Wasi add property failed: " + resp);
                log.warn("Wasi add non-success: {}", resp);
                return;
            }
            Integer wid = WasiJsonUtil.extractPropertyId(resp);
            if (wid == null) {
                activity("ERROR", "Wasi add: missing id_property in response");
                log.warn("Wasi add missing id_property: {}", resp);
                return;
            }
            String portalsJson = saveDto.getWasiPortalIds() == null || saveDto.getWasiPortalIds().isEmpty()
                    ? "[]"
                    : objectMapper.writeValueAsString(saveDto.getWasiPortalIds());
            WasiPropertySync row = WasiPropertySync.builder()
                    .property(property)
                    .wasiPropertyId(wid)
                    .syncedAt(LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")))
                    .syncPortalsJson(portalsJson)
                    .publishToWasi(true)
                    .build();
            syncRepository.save(row);

            uploadImagesFromAzure(property, wid);

            try {
                wasiApiClient.sendPropertyToPortal(wid);
            } catch (Exception ex) {
                log.warn("Wasi sendPropertyToPortal: {}", ex.getMessage());
            }
            wasiPropertyListCache.invalidate();
            activity("INFO", "Wasi: propiedad " + propertyId + " publicada (id Wasi " + wid + ")");
        } catch (Exception e) {
            activity("ERROR", "Wasi sync create: " + e.getMessage());
            log.error("Wasi sync after create failed", e);
        }
    }

    @Transactional
    public void syncAfterLocalUpdate(Long propertyId, PropertyUpdateDTO updateDto) {
        if (!wasiApiProperties.isConfigured()) {
            return;
        }
        Optional<WasiPropertySync> opt = syncRepository.findByProperty_Id(propertyId);
        if (opt.isEmpty()) {
            if (Boolean.TRUE.equals(updateDto.getPublishToWasi())) {
                Property p = propertyRepository.findById(propertyId).orElse(null);
                if (p != null) {
                    PropertySaveDTO pseudo = new PropertySaveDTO();
                    pseudo.setPublishToWasi(true);
                    pseudo.setWasiPortalIds(updateDto.getWasiPortalIds());
                    syncAfterLocalCreate(pseudo, propertyId);
                }
            }
            return;
        }
        WasiPropertySync sync = opt.get();
        Property property = propertyRepository.findById(propertyId).orElse(null);
        if (property == null) {
            return;
        }
        WasiLocationMapping loc = locationMappingRepository
                .findByNeighborhood_Id(property.getNeighborhood().getId())
                .orElse(null);
        if (loc == null) {
            activity("WARN", "Wasi update: sin mapeo de barrio propertyId=" + propertyId);
            return;
        }
        try {
            MultiValueMap<String, String> form = wasiMapper.propertyToWasiForm(property, loc, updateDto.getWasiPortalIds());
            JsonNode resp = wasiApiClient.updateProperty(sync.getWasiPropertyId(), form);
            if (!WasiJsonUtil.isSuccess(resp)) {
                activity("WARN", "Wasi update non-success: " + resp);
            }
            if (updateDto.getWasiPortalIds() != null && !updateDto.getWasiPortalIds().isEmpty()) {
                sync.setSyncPortalsJson(objectMapper.writeValueAsString(updateDto.getWasiPortalIds()));
            }
            sync.setSyncedAt(LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")));
            syncRepository.save(sync);

            if (updateDto.getMainImageUpdated() != null && !updateDto.getMainImageUpdated().isEmpty()) {
                byte[] main = azureBlobStorage.readBytes(property.getMainImage());
                if (main != null && main.length > 0) {
                    wasiApiClient.uploadPropertyImage(sync.getWasiPropertyId(), main, "main.jpg", "main", 1);
                }
            }
            try {
                wasiApiClient.sendPropertyToPortal(sync.getWasiPropertyId());
            } catch (Exception ex) {
                log.warn("Wasi sendPropertyToPortal after update: {}", ex.getMessage());
            }
            wasiPropertyListCache.invalidate();
            activity("INFO", "Wasi: propiedad " + propertyId + " actualizada en Wasi");
        } catch (Exception e) {
            activity("ERROR", "Wasi sync update: " + e.getMessage());
            log.error("Wasi sync after update failed", e);
        }
    }

    private void uploadImagesFromAzure(Property property, int wasiPropertyId) {
        int position = 1;
        byte[] main = azureBlobStorage.readBytes(property.getMainImage());
        if (main != null && main.length > 0) {
            wasiApiClient.uploadPropertyImage(wasiPropertyId, main, "main.jpg", "main", position++);
        }
        var imgs = imageRepository.findAllByPropertyId(property.getId());
        for (var img : imgs) {
            byte[] data = azureBlobStorage.readBytes(img.getUrl());
            if (data == null || data.length == 0) {
                continue;
            }
            String name = img.getUrl() != null && img.getUrl().contains("/")
                    ? img.getUrl().substring(img.getUrl().lastIndexOf('/') + 1)
                    : "gallery.jpg";
            wasiApiClient.uploadPropertyImage(wasiPropertyId, data, name, "gallery", position++);
        }
    }
}
