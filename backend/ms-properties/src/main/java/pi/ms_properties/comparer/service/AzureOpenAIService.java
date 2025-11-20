package pi.ms_properties.comparer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.impl.AzureBlobPropertiesStorage;
import pi.ms_properties.service.interf.IPropertyService;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AzureOpenAIService {

    @Value("${comparer.endpoint}")
    private String endpoint;

    @Value("${comparer.apiKey}")
    private String apiKey;

    @Value("${comparer.deployment}")
    private String deployment;

    @Value("${comparer.apiVersion}")
    private String apiVersion;

    private final IPropertyRepository propertyRepository;

    private final IPropertyService propertyService;

    private final AzureBlobPropertiesStorage azureBlobPropertiesStorage;

    private final WebClient webClient = WebClient.builder()
            .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
            .build();

    public String compareProperties(List<PropertyDTOAI> properties) {

        // 1) Obtener IDs de las propiedades enviadas
        List<Long> ids = properties.stream()
                .map(PropertyDTOAI::getId)
                .toList();

        // 2) Obtener URLs de JSON en Blob
        List<String> urls = ids.stream()
                .map(azureBlobPropertiesStorage::getPropertyUrl)
                .toList();

        // 3) Construir el prompt
        Map<String, Object> body = Map.of(
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", """
                    Sos un asesor inmobiliario en Córdoba, Argentina.
                    Te paso URLs de propiedades en formato JSON almacenadas en Azure Blob Storage.
                    Tu tarea es LEER esos archivos JSON y compararlas. Nombra que propiedad estas comparando, con el nombre simplificado.
                    Redactá un solo texto breve que compare las propiedades de forma natural, sin usar listas ni viñetas.
                    Usa un tono profesional.
                    Hacelo en tono cálido y profesional, como si se lo explicaras a un cliente de manera simple y cercana.
                    Mencioná de forma general las diferencias de ubicación, entorno, seguridad, tránsito y estilo de vida.
                    Si una está en zona céntrica y otra en una más residencial, destacá esa diferencia.
                    Podés referirte a comercios, espacios verdes o lugares conocidos de la zona, pero sin usar direcciones exactas.
                    No hables de negociar precios ni incluyas números de ningún tipo.
                    Limitá la respuesta a un texto mediano — como mucho 15 oraciones que sean fáciles de leer.
                    """
                        ),
                        Map.of(
                                "role", "user",
                                "content", "URLs de propiedades: " + urls
                        )
                ),
                "max_completion_tokens", 2000
        );

        String url = String.format(
                "%s/openai/deployments/%s/chat/completions?api-version=%s",
                endpoint, deployment, apiVersion
        );

        try {
            JsonNode response = webClient.post()
                    .uri(url)
                    .header("api-key", apiKey)
                    .header("Accept", "application/json")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            String content = response.at("/choices/0/message/content").asText();
            return content.isEmpty() ? "Azure no devolvió contenido." : content;

        } catch (Exception e) {
            return "Error al comunicarse con Azure: " + e.getMessage();
        }
    }

    public ResponseEntity<List<PropertySimpleDTO>> searchAndReturnProperties(String userQuery) {
        try {
            String iaResponse = searchProperties(userQuery);

            ObjectMapper mapper = new ObjectMapper();

            List<Map<String, Object>> iaResult = mapper.readValue(iaResponse, new TypeReference<List<Map<String, Object>>>() {});

            return propertyService.getPropertiesByIAResult(iaResult);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public String searchProperties(String userQuery) {
        try {
            List<Map<String, Object>> properties = propertyRepository.getPropertiesForAI();

            Map<String, Object> body = getPromptSearch(userQuery, properties);

            String url = String.format(
                    "%s/openai/deployments/%s/chat/completions?api-version=%s",
                    endpoint, deployment, apiVersion
            );

            JsonNode response = webClient.post()
                    .uri(url)
                    .header("api-key", apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return response.at("/choices/0/message/content").asText();

        } catch (Exception e) {
            return "Error IA: " + e.getMessage();
        }
    }

    private static Map<String, Object> getPromptSearch(String userQuery, List<Map<String, Object>> properties) {

        String systemPrompt = """
        Devolvé un JSON con coincidencias entre la consulta del usuario y la lista de propiedades.
        Cada propiedad tiene: id, type, neighborhood, address, rooms, bedrooms, bathrooms,
        operation, currency, price, amenities.
        Respondé así:
        [
          { "id": number, "score": number }
        ]
        No inventes propiedades. Ordená por score.
        """;

        ObjectMapper mapper = new ObjectMapper();

        String userPromptJson;
        try {
            userPromptJson = mapper.writeValueAsString(
                    Map.of(
                            "query", userQuery,
                            "properties", properties
                    )
            );
        } catch (Exception e) {
            userPromptJson = "{\"query\":\"" + userQuery + "\"}";
        }

        return Map.of(
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPromptJson)
                ),
                "max_completion_tokens", 1500
        );
    }
}
