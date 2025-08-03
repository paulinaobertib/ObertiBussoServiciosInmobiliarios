package pi.ms_properties.recommendationTest.pythonTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import pi.ms_properties.recommendation.python.MLClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MLClientTest {

    @InjectMocks
    private MLClient mlClient;

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(mlClient, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(mlClient, "mlApiUrl", "http://localhost:5000");
    }

    // casos de exito

    @Test
    void predict_shouldReturnPrediction_whenApiCallSucceeds() {
        String userId = "user123";
        Long propertyId = 10L;
        double expected = 0.87;

        String expectedUrl = UriComponentsBuilder
                .fromUriString("http://localhost:5000/predict")
                .queryParam("user_id", userId)
                .queryParam("property_id", propertyId)
                .toUriString();

        when(restTemplate.getForObject(expectedUrl, Double.class)).thenReturn(expected);

        double result = mlClient.predict(userId, propertyId);

        assertEquals(expected, result);
        verify(restTemplate).getForObject(expectedUrl, Double.class);
    }

    // casos de error
    @Test
    void predict_shouldReturnZero_whenApiCallFails() {
        String userId = "user123";
        Long propertyId = 10L;

        String expectedUrl = UriComponentsBuilder
                .fromUriString("http://localhost:5000/predict")
                .queryParam("user_id", userId)
                .queryParam("property_id", propertyId)
                .toUriString();

        when(restTemplate.getForObject(expectedUrl, Double.class))
                .thenThrow(new RuntimeException("ML API not reachable"));

        double result = mlClient.predict(userId, propertyId);

        assertEquals(0.0, result);
        verify(restTemplate).getForObject(expectedUrl, Double.class);
    }
}
