package pi.ms_properties.comparerTest.serviceTest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.comparer.service.AzureOpenAIService;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.interf.IPropertyService;
import reactor.core.publisher.Mono;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
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

    @Mock
    private IPropertyRepository propertyRepository;

    @Mock
    private IPropertyService propertyService;

    @InjectMocks
    private AzureOpenAIService service;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setup() throws Exception {
        Field webClientField = AzureOpenAIService.class.getDeclaredField("webClient");
        webClientField.setAccessible(true);
        webClientField.set(service, mockWebClient);

        setField("endpoint", "https://fake-endpoint");
        setField("apiKey", "12345");
        setField("deployment", "test-deploy");
        setField("apiVersion", "2025-04-16");
    }

    private void setField(String name, String value) throws Exception {
        Field field = AzureOpenAIService.class.getDeclaredField(name);
        field.setAccessible(true);
        field.set(service, value);
    }

    // casos de exito

    @Test
    void shouldReturnContent_whenAzureRespondsOk() throws Exception {
        String json = """
            {
              "choices": [
                { "message": { "content": "Comparación generada correctamente." } }
              ]
            }
        """;
        JsonNode mockResponse = mapper.readTree(json);

        when(mockWebClient.post()).thenReturn(mockRequestBodyUriSpec);
        when(mockRequestBodyUriSpec.uri(anyString())).thenReturn(mockRequestBodySpec);
        when(mockRequestBodySpec.header(anyString(), anyString())).thenReturn(mockRequestBodySpec);
        when(mockRequestBodySpec.bodyValue(any())).thenReturn(mockRequestHeadersSpec);
        when(mockRequestHeadersSpec.retrieve()).thenReturn(mockResponseSpec);
        when(mockResponseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(mockResponse));
        when(mockRequestBodySpec.contentType(MediaType.APPLICATION_JSON))
                .thenReturn(mockRequestBodySpec);


        PropertyDTOAI p1 = new PropertyDTOAI("Depto Centro", "Córdoba", -31.4, -64.18d, 3f, 1f, 1f, 80f, 70f, 100000f, "VENTA", "Departamento", Set.of("Pileta"));
        PropertyDTOAI p2 = new PropertyDTOAI("Casa GPaz", "General Paz", -31.42, -64.17d, 5f, 2f, 3f, 150f, 120f, 250000f, "VENTA", "Casa", Set.of("Cochera"));

        String result = service.compareProperties(List.of(p1, p2));

        assertEquals("Comparación generada correctamente.", result);
    }

    @Test
    void shouldGeneratePromptWithAllFields() {
        PropertyDTOAI p = new PropertyDTOAI(
                "Casa con jardín",
                "General Paz, Córdoba",
                -31.41,
                -64.17,
                4f,
                2f,
                2f,
                120f,
                110f,
                180000f,
                "VENTA",
                "Casa",
                Set.of("Cochera", "Patio")
        );

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
        when(mockWebClient.post()).thenThrow(
                new WebClientResponseException(400, "Bad Request", null, null, null)
        );

        PropertyDTOAI p1 = new PropertyDTOAI();

        String result = service.compareProperties(List.of(p1));

        assertTrue(result.contains("Error al comunicarse con Azure"));
    }

    @Test
    void shouldHandleMissingChoices() throws Exception {
        JsonNode mockResponse = mapper.readTree("{}"); // sin "choices"

        when(mockWebClient.post()).thenReturn(mockRequestBodyUriSpec);
        when(mockRequestBodyUriSpec.uri(anyString())).thenReturn(mockRequestBodySpec);
        when(mockRequestBodySpec.header(anyString(), anyString())).thenReturn(mockRequestBodySpec);
        when(mockRequestBodySpec.bodyValue(any())).thenReturn(mockRequestHeadersSpec);
        when(mockRequestHeadersSpec.retrieve()).thenReturn(mockResponseSpec);
        when(mockResponseSpec.bodyToMono(JsonNode.class)).thenReturn(Mono.just(mockResponse));
        when(mockRequestBodySpec.contentType(MediaType.APPLICATION_JSON))
                .thenReturn(mockRequestBodySpec);

        String result = service.compareProperties(List.of(new PropertyDTOAI()));

        assertEquals("Azure no devolvió contenido", result);
    }

    @Test
    void shouldReturn500_whenIAThrowsError() {
        when(mockWebClient.post()).thenThrow(new RuntimeException("IA error"));

        ResponseEntity<List<PropertySimpleDTO>> response =
                service.searchAndReturnProperties("algo");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}