package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Optional;

@Service
public class GeocodingNeighborhoodService {

    private final WebClient webClient;
    private final String googleMapsApiKey;

    public GeocodingNeighborhoodService(WebClient.Builder webClientBuilder,
                                        @Value("${google.maps.api-key}") String googleMapsApiKey) {
        this.webClient = webClientBuilder
                .baseUrl("https://maps.googleapis.com")
                .build();
        this.googleMapsApiKey = googleMapsApiKey;
    }

    public Optional<Coordinates> getCoordinates(String neighborhoodName, String city) {
        String address = neighborhoodName + ", " + city + ", Argentina";

        JsonNode json = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/maps/api/geocode/json")
                        .queryParam("address", address)
                        .queryParam("key", googleMapsApiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        JsonNode results = json != null ? json.get("results") : null;
        if (results != null && results.isArray() && !results.isEmpty()) {
            JsonNode location = results.get(0).path("geometry").path("location");
            if (!location.has("lat") || !location.has("lng")) {
                return Optional.empty();
            }
            double lat = location.get("lat").asDouble();
            double lon = location.get("lng").asDouble();
            return Optional.of(new Coordinates(lat, lon));
        }

        return Optional.empty();
    }

    public record Coordinates(double latitude, double longitude) {}
}