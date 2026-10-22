package pi.ms_users.contractpdf;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// llamada a Azure OpenAI (chat completions), igual que el comparador de ms-properties
@Component
public class ContractAiClient {

    private final String endpoint;
    private final String apiKey;
    private final String deployment;
    private final String apiVersion;

    private final WebClient webClient = WebClient.builder()
            .exchangeStrategies(ExchangeStrategies.builder()
                    .codecs(c -> c.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                    .build())
            .build();

    public ContractAiClient(@Value("${contract-ai.endpoint:}") String endpoint,
                            @Value("${contract-ai.apiKey:}") String apiKey,
                            @Value("${contract-ai.deployment:}") String deployment,
                            @Value("${contract-ai.apiVersion:}") String apiVersion) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.deployment = deployment;
        this.apiVersion = apiVersion;
    }

    public boolean isConfigured() {
        return !endpoint.isBlank() && !apiKey.isBlank() && !deployment.isBlank() && !apiVersion.isBlank();
    }

    public String complete(String systemPrompt, PdfContent content) {
        List<Object> userContent = new ArrayList<>();
        if (content.isScanned()) {
            userContent.add(Map.of("type", "text", "text", "Estas son las páginas escaneadas del contrato:"));
            for (String img : content.pageImagesDataUri()) {
                userContent.add(Map.of("type", "image_url", "image_url", Map.of("url", img)));
            }
        } else {
            userContent.add(Map.of("type", "text", "text", "Texto del contrato:\n\n" + content.text()));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userContent)));
        body.put("max_completion_tokens", 4000);
        body.put("response_format", Map.of("type", "json_object"));

        try {
            return call(body);
        } catch (WebClientResponseException.BadRequest e) {
            // hay deployments que no aceptan response_format: se reintenta sin eso
            body.remove("response_format");
            return call(body);
        }
    }

    private String call(Map<String, Object> body) {
        String url = String.format("%s/openai/deployments/%s/chat/completions?api-version=%s",
                endpoint.replaceAll("/+$", ""), deployment, apiVersion);
        JsonNode response = webClient.post()
                .uri(url)
                .header("api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block(Duration.ofSeconds(120));
        return response == null ? "" : response.at("/choices/0/message/content").asText("");
    }
}
