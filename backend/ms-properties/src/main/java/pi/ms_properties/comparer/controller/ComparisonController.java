package pi.ms_properties.comparer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.comparer.service.AzureOpenAIService;
import pi.ms_properties.comparer.service.GeolocationService;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySimpleDTO;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/compare")
public class ComparisonController {

    private final GeolocationService geoService;

    private final AzureOpenAIService azureOpenAIService;

    @PostMapping
    public ResponseEntity<String> comparer(@RequestBody List<PropertyDTOAI> properties) {
        if (properties.size() < 2 || properties.size() > 3) {
            return ResponseEntity.badRequest().body("Debe enviar 2 o 3 propiedades.");
        }

        List<PropertyDTOAI> geolocated = properties.stream()
                .map(p -> {
                    if (p.getLatitude() != null && p.getLongitude() != null) {
                        return p;
                    }
                    return geoService.geolocation(p);
                })
                .toList();

        String result = azureOpenAIService.compareProperties(geolocated);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/search")
    public ResponseEntity<List<PropertySimpleDTO>> searchFull(@RequestParam String query) {
        return azureOpenAIService.searchAndReturnProperties(query);
    }
}

