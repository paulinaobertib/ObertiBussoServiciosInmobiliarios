package pi.ms_properties.recommendation.python;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Component
public class MLClient {

    @Value("${ml.api.url}")
    private String mlApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public double predict(String userId, Long propertyId) {
        try {
            String url = UriComponentsBuilder
                    .fromUriString(mlApiUrl + "/predict")
                    .queryParam("user_id", userId)
                    .queryParam("property_id", propertyId)
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response.containsKey("prediction")) {
                return ((Number) response.get("prediction")).doubleValue();
            } else {
                return 0.0;
            }
        } catch (Exception e) {
            System.err.println("Error al llamar a ML API: " + e.getMessage());
            return 0.0;
        }
    }
}

