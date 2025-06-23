package pi.ms_properties.comparerTest.serviceTest;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
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

        Exception exception = assertThrows(RuntimeException.class, () -> {
            geminiService.compareProperties(List.of(property));
        });

        String expectedMessage = "500";
        String actualMessage = exception.getMessage();

        assertTrue(actualMessage.contains(expectedMessage));
    }
}
