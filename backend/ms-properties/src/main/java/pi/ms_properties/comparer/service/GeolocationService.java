package pi.ms_properties.comparer.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import pi.ms_properties.comparer.dto.PropertyDTOAI;

@Service
public class GeolocationService {

    private final WebClient webClient;
    private final String googleMapsApiKey;

    public GeolocationService(WebClient.Builder webClientBuilder,
                              @Value("${google.maps.api-key}") String googleMapsApiKey) {
        this.webClient = webClientBuilder
                .baseUrl("https://maps.googleapis.com")
                .build();
        this.googleMapsApiKey = googleMapsApiKey;
    }

    public PropertyDTOAI geolocation(PropertyDTOAI property) {
        try {
            JsonNode result = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/maps/api/geocode/json")
                            .queryParam("address", property.getAddress())
                            .queryParam("key", googleMapsApiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            JsonNode results = result != null ? result.get("results") : null;
            if (results != null && results.isArray() && !results.isEmpty()) {
                JsonNode location = results.get(0).path("geometry").path("location");
                if (location.has("lat") && location.has("lng")) {
                    property.setLatitude(location.get("lat").asDouble());
                    property.setLongitude(location.get("lng").asDouble());
                }
            }

        } catch (Exception e) {
            System.out.println("Error geolocalizando: " + e.getMessage());
        }

        return property;
    }
}