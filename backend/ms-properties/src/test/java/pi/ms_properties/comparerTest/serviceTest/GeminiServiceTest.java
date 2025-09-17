package pi.ms_properties.comparerTest.serviceTest;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.comparer.service.GeminiService;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class GeminiServiceTest {

    private MockWebServer mockWebServer;

    private GeminiService geminiService;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        geminiService = new GeminiService();

        ReflectionTestUtils.setField(geminiService, "apiKey", "fake-key");
        ReflectionTestUtils.setField(geminiService, "webClient", WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build());
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    private static @NotNull PropertyDTOAI getPropertyDTOAI() {
        PropertyDTOAI property = new PropertyDTOAI();
        property.setName("Casa Moderna");
        property.setAddress("Av. Siempre Viva 742");
        property.setLatitude(-31.4201D);
        property.setLongitude(-64.1888D);
        property.setRooms(4f);
        property.setBedrooms(3f);
        property.setBathrooms(2f);
        property.setArea(200f);
        property.setCoveredArea(150f);
        property.setPrice(250000f);
        property.setOperation("Venta");
        property.setType("Casa");
        property.setAmenities(Set.of("Pileta", "Cochera"));
        return property;
    }

    // casos de exito

    @Test
    void testCompareProperties_success() {
        String responseBody = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": "Comparación de propiedades..." }
                        ]
                      }
                    }
                  ]
                }
                """;

        mockWebServer.enqueue(new MockResponse()
                .setBody(responseBody)
                .addHeader("Content-Type", "application/json"));

        PropertyDTOAI property = new PropertyDTOAI();
        property.setAddress("Córdoba");
        property.setPrice(150000.0F);

        String result = geminiService.compareProperties(List.of(property));

        assertNotNull(result);
        assertTrue(result.contains("Comparación"));
    }

    @Test
    void whenAllFieldsArePresent_shouldIncludeAllData() {
        PropertyDTOAI property = getPropertyDTOAI();

        String prompt = ReflectionTestUtils.invokeMethod(
                geminiService, "generatePrompt", List.of(property));

        assertThat(prompt).contains("Casa Moderna");
        assertThat(prompt).contains("Av. Siempre Viva 742");
        assertThat(prompt).contains("Latitud -31.4201, Longitud -64.1888");
        assertThat(prompt).contains("Ambientes: 4.0");
        assertThat(prompt).contains("Dormitorios: 3.0");
        assertThat(prompt).contains("Baños: 2.0");
        assertThat(prompt).contains("Superficie total: 200.0 m²");
        assertThat(prompt).contains("Superficie cubierta: 150.0 m²");
        assertThat(prompt).contains("Precio: $250000.0");
        assertThat(prompt).contains("Operación: Venta");
        assertThat(prompt).contains("Tipo: Casa");
        assertThat(prompt).containsAnyOf("Amenidades: Pileta, Cochera", "Amenidades: Cochera, Pileta");
    }

    @Test
    void whenOptionalFieldsAreNull_shouldFallbackToDefaults() {
        PropertyDTOAI property = new PropertyDTOAI();
        property.setAddress("Sin dirección");

        String prompt = ReflectionTestUtils.invokeMethod(
                geminiService, "generatePrompt", List.of(property));

        assertThat(prompt).contains("Propiedad: Sin nombre");
        assertThat(prompt).contains("Ambientes: N/A");
        assertThat(prompt).contains("Dormitorios: N/A");
        assertThat(prompt).contains("Baños: N/A");
        assertThat(prompt).contains("Superficie total: N/A");
        assertThat(prompt).contains("Superficie cubierta: N/A");
        assertThat(prompt).contains("Precio: N/D");
        assertThat(prompt).contains("Operación: N/A");
        assertThat(prompt).contains("Tipo: N/A");
        assertThat(prompt).contains("Amenidades: Ninguna");
    }

    @Test
    void whenAmenitiesIsEmpty_shouldShowNinguna() {
        PropertyDTOAI property = new PropertyDTOAI();
        property.setName("Depto Centro");
        property.setAddress("Córdoba");
        property.setAmenities(Set.of());

        String prompt = ReflectionTestUtils.invokeMethod(
                geminiService, "generatePrompt", List.of(property));

        assertThat(prompt).contains("Depto Centro");
        assertThat(prompt).contains("Amenidades: Ninguna");
    }

    @Test
    void whenMultipleProperties_shouldListAll() {
        PropertyDTOAI p1 = new PropertyDTOAI();
        p1.setName("Casa Barrio");
        p1.setAddress("Córdoba");

        PropertyDTOAI p2 = new PropertyDTOAI();
        p2.setName("Depto Centro");
        p2.setAddress("Córdoba");

        String prompt = ReflectionTestUtils.invokeMethod(
                geminiService, "generatePrompt", List.of(p1, p2));

        assertThat(prompt).contains("Casa Barrio");
        assertThat(prompt).contains("Depto Centro");
    }

    // casos de error

    @Test
    void testCompareProperties_apiError() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(500)
                .setBody("{\"error\":\"Internal Server Error\"}")
                .addHeader("Content-Type", "application/json"));

        PropertyDTOAI property = new PropertyDTOAI();
        property.setAddress("Córdoba");
        property.setPrice(150000.0F);

        Exception exception = assertThrows(RuntimeException.class, () ->
            geminiService.compareProperties(List.of(property)));

        String expectedMessage = "500";
        String actualMessage = exception.getMessage();

        assertTrue(actualMessage.contains(expectedMessage));
    }
}
