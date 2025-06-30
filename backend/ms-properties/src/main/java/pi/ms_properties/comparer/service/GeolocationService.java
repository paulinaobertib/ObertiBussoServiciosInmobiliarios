package pi.ms_properties.comparer.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import pi.ms_properties.comparer.dto.PropertyDTOAI;

@Service
public class GeolocationService {

    private final WebClient webClient;

    public GeolocationService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "mi-app-inmobiliaria")
                .build();
    }

    public PropertyDTOAI geolocation(PropertyDTOAI property) {
        try {
            JsonNode result = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", property.getAddress())
                            .queryParam("format", "json")
                            .queryParam("limit", "1")
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (result != null && result.isArray() && !result.isEmpty()) {
                JsonNode node = result.get(0);
                property.setLatitude(node.get("lat").asDouble());
                property.setLongitude(node.get("lon").asDouble());
            }

        } catch (Exception e) {
            System.out.println("Error geolocalizando: " + e.getMessage());
        }

        return property;
    }
}