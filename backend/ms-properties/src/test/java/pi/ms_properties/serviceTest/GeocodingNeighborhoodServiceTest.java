package pi.ms_properties.serviceTest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import pi.ms_properties.service.impl.GeocodingNeighborhoodService;
import reactor.core.publisher.Mono;

import java.util.Optional;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeocodingNeighborhoodServiceTest {

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

    private GeocodingNeighborhoodService service;

    @BeforeEach
    void setup() {
        when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);
        service = new GeocodingNeighborhoodService(webClientBuilder, "test-api-key");
    }

    // casos de exito

    @Test
    void getCoordinates_existingNeighborhood_success() throws Exception {
        String json = """
                {
                  "results": [
                    {
                      "geometry": {
                        "location": {
                          "lat": -34.6037,
                          "lng": -58.3816
                        }
                      }
                    }
                  ],
                  "status": "OK"
                }
                """;
        JsonNode node = new ObjectMapper().readTree(json);

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Function<org.springframework.web.util.UriComponentsBuilder, ?> uriFunction =
                    (Function<org.springframework.web.util.UriComponentsBuilder, ?>) invocation.getArgument(0);

            String uri = uriFunction.apply(org.springframework.web.util.UriComponentsBuilder.fromPath("")).toString();
            assertTrue(uri.startsWith("/maps/api/geocode/json?address=Palermo,%20Buenos%20Aires,%20Argentina"));
            assertTrue(uri.contains("key=test-api-key"));
            return requestHeadersSpec;
        });
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(node));

        Optional<GeocodingNeighborhoodService.Coordinates> result =
                service.getCoordinates("Palermo", "Buenos Aires");

        assertTrue(result.isPresent());
        assertEquals(-34.6037, result.get().latitude());
        assertEquals(-58.3816, result.get().longitude());
    }

    // casos de error

    @Test
    void getCoordinates_nonExistingNeighborhood_returnsEmpty() throws Exception {
        String json = """
                {
                  "results": [],
                  "status": "ZERO_RESULTS"
                }
                """;

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(new ObjectMapper().readTree(json)));

        Optional<GeocodingNeighborhoodService.Coordinates> result =
                service.getCoordinates("BarrioQueNoExisteXYZ", "CiudadQueNoExisteXYZ");

        assertTrue(result.isEmpty());
    }
}