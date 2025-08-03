package pi.ms_properties.comparer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.comparer.service.GeminiService;
import pi.ms_properties.comparer.service.GeolocationService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/compare")
public class ComparisonController {

    private final GeolocationService geoService;

    private final GeminiService geminiService;

    @PostMapping
    public ResponseEntity<String> comparer(@RequestBody List<PropertyDTOAI> properties) {
        if (properties.size() < 2 || properties.size() > 3) {
            return ResponseEntity.badRequest().body("Debe enviar 2 o 3 propiedades.");
        }

        List<PropertyDTOAI> geolocated = properties.stream()
                .map(geoService::geolocation)
                .toList();

        String result = geminiService.compareProperties(geolocated);
        return ResponseEntity.ok(result);
    }
}

