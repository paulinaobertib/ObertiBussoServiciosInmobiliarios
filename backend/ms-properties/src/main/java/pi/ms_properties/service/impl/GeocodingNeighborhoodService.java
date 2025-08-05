package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Optional;

@Service
public class GeocodingNeighborhoodService {

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://nominatim.openstreetmap.org")
            .defaultHeader("User-Agent", "mi-app-inmobiliaria")
            .build();

    public Optional<Coordinates> getCoordinates(String neighborhoodName, String city) {
        String query = neighborhoodName + ", " + city + ", Argentina";

        JsonNode json = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", query)
                        .queryParam("format", "json")
                        .queryParam("limit", "1")
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        if (json != null && json.isArray() && !json.isEmpty()) {
            JsonNode first = json.get(0);
            double lat = first.get("lat").asDouble();
            double lon = first.get("lon").asDouble();
            return Optional.of(new Coordinates(lat, lon));
        }

        return Optional.empty();
    }

    public record Coordinates(double latitude, double longitude) {}
}