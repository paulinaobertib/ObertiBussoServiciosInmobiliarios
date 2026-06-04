package pi.ms_properties.controller;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Neighborhood;
import pi.ms_properties.domain.WasiLocationMapping;
import pi.ms_properties.dto.wasi.WasiActivityEntryDTO;
import pi.ms_properties.dto.wasi.WasiLocationMappingRequestDTO;
import pi.ms_properties.dto.wasi.WasiSyncStatusDTO;
import pi.ms_properties.repository.INeighborhoodRepository;
import pi.ms_properties.repository.IWasiLocationMappingRepository;
import pi.ms_properties.wasi.WasiApiClient;
import pi.ms_properties.wasi.WasiApiProperties;
import pi.ms_properties.wasi.WasiJsonUtil;
import pi.ms_properties.wasi.WasiPropertySyncService;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/property/wasi")
@RequiredArgsConstructor
public class WasiController {

    private final WasiApiClient wasiApiClient;
    private final WasiApiProperties wasiApiProperties;
    private final IWasiLocationMappingRepository locationMappingRepository;
    private final INeighborhoodRepository neighborhoodRepository;
    private final WasiPropertySyncService wasiPropertySyncService;
    private final pi.ms_properties.service.impl.PropertyMergeService propertyMergeService;

    @GetMapping("/portals")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<Map<String, Object>>> portals() {
        if (!wasiApiProperties.isConfigured()) {
            return ResponseEntity.ok(List.of());
        }
        JsonNode root = wasiApiClient.listPortals();
        List<Map<String, Object>> out = new ArrayList<>();
        if (WasiJsonUtil.isSuccess(root)) {
            for (JsonNode n : WasiJsonUtil.indexedItems(root)) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", n.path("id_portal").asInt(n.path("id").asInt(0)));
                m.put("name", n.path("name").asText(n.path("portal_name").asText("")));
                out.add(m);
            }
        }
        return ResponseEntity.ok(out);
    }

    @GetMapping("/companies")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<String>> companies() {
        return ResponseEntity.ok(propertyMergeService.originOptions());
    }

    @GetMapping("/sync-status/{propertyId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<WasiSyncStatusDTO> syncStatus(@PathVariable Long propertyId) {
        return wasiPropertySyncService.getSyncStatus(propertyId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(WasiSyncStatusDTO.builder().synced(false).build()));
    }

    @PostMapping("/locations/mapping")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<String> saveMapping(@RequestBody WasiLocationMappingRequestDTO body) {
        Neighborhood nb = neighborhoodRepository.findById(body.getNeighborhoodId())
                .orElseThrow(() -> new IllegalArgumentException("Barrio no encontrado"));
        WasiLocationMapping m = locationMappingRepository.findByNeighborhood_Id(nb.getId())
                .orElseGet(WasiLocationMapping::new);
        m.setNeighborhood(nb);
        m.setWasiCountryId(body.getWasiCountryId());
        m.setWasiRegionId(body.getWasiRegionId());
        m.setWasiCityId(body.getWasiCityId());
        m.setWasiLocationId(body.getWasiLocationId());
        m.setWasiZoneId(body.getWasiZoneId());
        locationMappingRepository.save(m);
        return ResponseEntity.ok("ok");
    }

    @GetMapping("/locations/countries")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<JsonNode> countries() {
        if (!wasiApiProperties.isConfigured()) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(wasiApiClient.allCountries());
    }

    @GetMapping("/locations/regions/{countryId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<JsonNode> regions(@PathVariable int countryId) {
        if (!wasiApiProperties.isConfigured()) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(wasiApiClient.regionsFromCountry(countryId));
    }

    @GetMapping("/locations/cities/{regionId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<JsonNode> cities(@PathVariable int regionId) {
        if (!wasiApiProperties.isConfigured()) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(wasiApiClient.citiesFromRegion(regionId));
    }

    @GetMapping("/activity")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<WasiActivityEntryDTO>> activity() {
        return ResponseEntity.ok(WasiPropertySyncService.recentActivity());
    }
}
