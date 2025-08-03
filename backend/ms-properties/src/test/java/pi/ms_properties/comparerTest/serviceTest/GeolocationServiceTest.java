package pi.ms_properties.comparerTest.serviceTest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.comparer.service.GeolocationService;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeolocationServiceTest {

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private WebClient webClient;

    @Mock
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private GeolocationService geolocationService;

    @BeforeEach
    void setup() {
        when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.defaultHeader(anyString(), anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);
        geolocationService = new GeolocationService(webClientBuilder);
    }

    // casos de exito

    @Test
    void testGeolocation_success() {
        String json = "[{\"lat\": \"-31.4167\", \"lon\": \"-64.1833\"}]";
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode mockJsonNode;
        try {
            mockJsonNode = objectMapper.readTree(json);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        lenient().when(webClient.get()).thenReturn(requestHeadersUriSpec);
        lenient().when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        lenient().when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestHeadersSpec);
        lenient().when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        lenient().when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(mockJsonNode));

        PropertyDTOAI property = new PropertyDTOAI();
        property.setAddress("Córdoba, Argentina");

        PropertyDTOAI result = geolocationService.geolocation(property);

        assertEquals(-31.4167, result.getLatitude());
        assertEquals(-64.1833, result.getLongitude());
    }

    // casos de error

    @Test
    void testGeolocalizate_error() {
        lenient().when(webClient.get()).thenReturn(requestHeadersUriSpec);
        lenient().when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        lenient().when(requestHeadersSpec.header(anyString(), anyString())).thenReturn(requestHeadersSpec);
        lenient().when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        lenient().when(responseSpec.bodyToMono(JsonNode.class)).thenThrow(new RuntimeException("Falla en API"));

        PropertyDTOAI property = new PropertyDTOAI();
        property.setAddress("Córdoba, Argentina");

        PropertyDTOAI result = geolocationService.geolocation(property);

        assertNull(result.getLatitude());
        assertNull(result.getLongitude());
    }
}

