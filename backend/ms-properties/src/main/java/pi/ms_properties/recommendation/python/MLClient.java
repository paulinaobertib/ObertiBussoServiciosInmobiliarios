package pi.ms_properties.recommendation.python;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class MLClient {

    @Value("${ml.api.url}")
    private String mlApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public double predict(String userId, Long propertyId) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(mlApiUrl + "/predict")
                    .queryParam("user_id", userId)
                    .queryParam("property_id", propertyId)
                    .toUriString();

            return restTemplate.getForObject(url, Double.class);
        } catch (Exception e) {
            System.err.println("Error al llamar a ML API: " + e.getMessage());
            return 0.0;
        }
    }
}

