package pi.ms_properties.comparerTest.serviceTest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.comparer.service.AzureOpenAIService;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AzureOpenAIServiceTest {

    @Mock
    private WebClient mockWebClient;

    @Mock
    private WebClient.RequestBodyUriSpec mockRequestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec mockRequestBodySpec;

    @Mock
    private WebClient.RequestHeadersSpec mockRequestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec mockResponseSpec;

    @InjectMocks
    private AzureOpenAIService service = new AzureOpenAIService();

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        service = new AzureOpenAIService();
        service.getClass().getDeclaredFields();
        service.getClass();
        service = spy(service);

        service.getClass().getDeclaredFields();
        setField("endpoint", "https://fake-endpoint");
        setField("apiKey", "12345");
        setField("deployment", "test-deploy");
        setField("apiVersion", "2025-04-16");
    }

    private void setField(String name, String value) {
        try {
            var field = AzureOpenAIService.class.getDeclaredField(name);
            field.setAccessible(true);
            field.set(service, value);
        } catch (Exception ignored) {}
    }

    // casos de exito

    @Test
    void shouldReturnContent_whenAzureRespondsOk() throws Exception {
        String json = """
            {
              "choices": [
                {
                  "message": {
                    "content": "Comparación generada correctamente."
                  }
                }
              ]
            }
        """;
        JsonNode mockResponse = mapper.readTree(json);

        when(mockWebClient.post()).thenReturn(mockRequestBodyUriSpec);
        when(mockRequestBodyUriSpec.uri(any(String.class))).thenReturn(mockRequestBodySpec);
        when(mockRequestBodySpec.header(any(), any())).thenReturn(mockRequestBodySpec);
        when(mockRequestBodySpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(mockRequestBodySpec);
        when(mockRequestBodySpec.bodyValue(any())).thenReturn(mockRequestHeadersSpec);
        when(mockRequestHeadersSpec.retrieve()).thenReturn(mockResponseSpec);
        when(mockResponseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(mockResponse));

        var field = AzureOpenAIService.class.getDeclaredField("webClient");
        field.setAccessible(true);
        field.set(service, mockWebClient);

        PropertyDTOAI p1 = new PropertyDTOAI("Depto Centro", "Córdoba", -31.4, -64.18d, 3f, 1f, 1f, 80f, 70f, 100000f, "VENTA", "Departamento", Set.of("Pileta"));
        PropertyDTOAI p2 = new PropertyDTOAI("Casa GPaz", "General Paz", -31.42, -64.17d, 5f, 2f, 3f, 150f, 120f, 250000f, "VENTA", "Casa", Set.of("Cochera"));

        String result = service.compareProperties(List.of(p1, p2));

        assertEquals("Comparación generada correctamente.", result);
    }

    @Test
    void shouldGeneratePromptWithAllFields() {
        PropertyDTOAI p = new PropertyDTOAI();
        p.setName("Casa con jardín");
        p.setAddress("General Paz, Córdoba");
        p.setLatitude(-31.41);
        p.setLongitude(-64.17);
        p.setRooms(4f);
        p.setBedrooms(2f);
        p.setBathrooms(2f);
        p.setArea(120f);
        p.setCoveredArea(110f);
        p.setPrice(180000f);
        p.setOperation("VENTA");
        p.setType("Casa");
        p.setAmenities(Set.of("Cochera", "Patio"));

        String prompt = invokeGeneratePrompt(List.of(p));
        assertTrue(prompt.contains("Casa con jardín"));
        assertTrue(prompt.contains("Cochera"));
        assertTrue(prompt.contains("VENTA"));
        assertTrue(prompt.contains("Redactá un solo texto breve"));
    }

    private String invokeGeneratePrompt(List<PropertyDTOAI> props) {
        try {
            var method = AzureOpenAIService.class.getDeclaredMethod("generatePrompt", List.class);
            method.setAccessible(true);
            return (String) method.invoke(service, props);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // casos de error

    @Test
    void shouldReturnErrorMessage_whenAzureFails() {
        lenient().when(mockWebClient.post()).thenThrow(
                new WebClientResponseException(400, "Bad Request", null, null, null)
        );

        PropertyDTOAI p1 = new PropertyDTOAI();
        String result = service.compareProperties(List.of(p1, p1));

        assertTrue(result.contains("Error al comunicarse con Azure"));
    }
}