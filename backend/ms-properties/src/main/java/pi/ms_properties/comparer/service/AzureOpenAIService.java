package pi.ms_properties.comparer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertyFilterDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.repository.IAmenityRepository;
import pi.ms_properties.repository.INeighborhoodRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.ITypeRepository;
import pi.ms_properties.service.interf.IPropertyService;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

    private final IAmenityRepository amenityRepository;

    private final ITypeRepository typeRepository;

    private final INeighborhoodRepository neighborhoodRepository;

    private final IPropertyService propertyService;

    private final WebClient webClient = WebClient.builder()
            .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
            .build();

    public String compareProperties(List<PropertyDTOAI> properties) {
        String prompt = generatePrompt(properties);

        Map<String, Object> body = Map.of(
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "Sos un asesor inmobiliario en Córdoba, Argentina. Respondé con texto natural en español, como si hablaras con un cliente."),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_completion_tokens", 2000,
                "top_p", 1,
                "frequency_penalty", 0,
                "presence_penalty", 0
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

            String result = response.at("/choices/0/message/content").asText();
            return result.isEmpty() ? "Azure no devolvió contenido" : result;

        } catch (Exception e) {
            return "Error al comunicarse con Azure: " + e.getMessage();
        }
    }

    private String generatePrompt(List<PropertyDTOAI> properties) {
        StringBuilder sb = new StringBuilder(
                "Sos un asesor inmobiliario en Córdoba, Argentina. Compará estas propiedades en base a ubicación, precio, superficie, comodidades y características generales:\n\n"
        );

        for (PropertyDTOAI p : properties) {
            sb.append("Propiedad: ").append(p.getName() != null ? p.getName() : "Sin nombre").append("\n");
            sb.append(" - Dirección: ").append(p.getAddress() != null ? p.getAddress() : "N/A").append("\n");

            if (p.getLatitude() != null && p.getLongitude() != null) {
                sb.append(" - Coordenadas: Latitud ").append(p.getLatitude())
                        .append(", Longitud ").append(p.getLongitude()).append("\n");
            }

            sb.append(" - Ambientes: ").append(p.getRooms() != null ? p.getRooms() : "N/A").append("\n");
            sb.append(" - Dormitorios: ").append(p.getBedrooms() != null ? p.getBedrooms() : "N/A").append("\n");
            sb.append(" - Baños: ").append(p.getBathrooms() != null ? p.getBathrooms() : "N/A").append("\n");
            sb.append(" - Superficie total: ").append(p.getArea() != null ? p.getArea() + " m²" : "N/A").append("\n");
            sb.append(" - Superficie cubierta: ").append(p.getCoveredArea() != null ? p.getCoveredArea() + " m²" : "N/A").append("\n");
            sb.append(" - Precio: ").append(p.getPrice() != null ? "$" + p.getPrice() : "N/D").append("\n");
            sb.append(" - Operación: ").append(p.getOperation() != null ? p.getOperation() : "N/A").append("\n");
            sb.append(" - Tipo: ").append(p.getType() != null ? p.getType() : "N/A").append("\n");

            if (p.getAmenities() != null && !p.getAmenities().isEmpty()) {
                sb.append(" - Amenidades: ");
                String amenitiesStr = p.getAmenities().stream()
                        .map(Object::toString)
                        .collect(Collectors.joining(", "));
                sb.append(amenitiesStr).append("\n");
            } else {
                sb.append(" - Amenidades: Ninguna\n");
            }

            sb.append("\n");
        }

        sb.append("""
            Redactá un solo texto breve que compare las propiedades de forma natural, sin usar listas ni viñetas.
            Usa un tono profesional.
            Hacelo en tono cálido y profesional, como si se lo explicaras a un cliente de manera simple y cercana.
            Mencioná de forma general las diferencias de ubicación, entorno, seguridad, tránsito y estilo de vida.
            Si una está en zona céntrica y otra en una más residencial, destacá esa diferencia.
            Podés referirte a comercios, espacios verdes o lugares conocidos de la zona, pero sin usar direcciones exactas.
            No hables de negociar precios ni incluyas números de ningún tipo.
            Limitá la respuesta a un texto mediano — como mucho 15 oraciones que sean fáciles de leer.
            """
        );

        sb.append("\nRespondé de forma completa y detallada según las instrucciones anteriores.");

        return sb.toString();
    }

    @Transactional
    public ResponseEntity<List<PropertySimpleDTO>> searchAndReturnProperties(String userQuery) {
        try {
            PropertyFilterDTO filters = extractFilters(userQuery);

            List<Property> base = propertyRepository.searchByFilters(filters);

            base = filterAmenities(base, filters);

            base = base.stream().toList();

            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

            List<Map<String, Object>> propsForAI = base.stream()
                    .map(p -> mapper.convertValue(p, new TypeReference<Map<String, Object>>() {}))
                    .toList();

            String iaResponse = searchProperties(userQuery, propsForAI);

            List<Map<String, Object>> iaResult = mapper.readValue(
                    iaResponse,
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            return propertyService.getPropertiesByIAResult(iaResult);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("ERROR PARSING IA RESPONSE: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    public String searchProperties(String userQuery, List<Map<String, Object>> filteredProperties) {
        try {
            Map<String, Object> body = getPromptSearch(userQuery, filteredProperties);

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

    private List<Property> filterAmenities(List<Property> props, PropertyFilterDTO filters) {
        if (filters.getAmenities() == null || filters.getAmenities().isEmpty()) {
            return props;
        }

        List<String> amenitiesLower = filters.getAmenities().stream()
                .map(String::toLowerCase)
                .toList();

        return props.stream()
                .filter(p -> {
                    Set<String> current = p.getAmenities().stream()
                            .map(a -> a.getName().toLowerCase())
                            .collect(Collectors.toSet());
                    return current.containsAll(amenitiesLower);
                })
                .toList();
    }

    public PropertyFilterDTO extractFilters(String userQuery) {
        try {
            List<String> amenities = amenityRepository.findAll()
                    .stream()
                    .map(a -> a.getName().toLowerCase())
                    .toList();

            String amenitiesJson = new ObjectMapper().writeValueAsString(amenities);

            List<String> types = typeRepository.findAll()
                    .stream()
                    .map(t -> t.getName().toLowerCase())
                    .toList();

            String typesJson = new ObjectMapper().writeValueAsString(types);

            List<String> neighborhoods = neighborhoodRepository.findAll()
                    .stream()
                    .map(n -> n.getName().toLowerCase())
                    .toList();

            String neighborhoodsJson = new ObjectMapper().writeValueAsString(neighborhoods);

            String prompt = """
            Extraé filtros inmobiliarios del texto: "%s".
            Devolvé SOLO este JSON:
            {"street":null,"rooms":null,"bathrooms":null,"bedrooms":null,"area":null,
            "coveredArea":null,"price":null,"expenses":null,"currency":null,"operation":null,
            "type":null,"neighborhood":null,"credit":null,"financing":null,"amenities":null}
            Reglas:
            - Tipos válidos: %s
            - Barrios válidos: %s
            - Amenities válidas: %s
            - Mapear sinónimos comunes ARG: "garage"→"cochera", "piscina"→"pileta",
            "asado"→"asador", "security"→"seguridad", "gym"→"gimnasio".
            - "apta credito"→credit=true
            - "financiable" "financiacion"→financing=true
            - "USD/dólares"→"USD"
            - "ARS/pesos"→"ARS"
            - "hasta X"→price=X
            - rooms = ambientes, cantidad de lugares; bedrooms = dormitorios, donde se duerme.
            - Si falta un dato → null.
            """.formatted(userQuery, typesJson, neighborhoodsJson, amenitiesJson);

            JsonNode response = webClient.post()
                    .uri(endpoint + "/openai/deployments/" + deployment + "/chat/completions?api-version=" + apiVersion)
                    .header("api-key", apiKey)
                    .bodyValue(Map.of(
                            "messages", List.of(
                                    Map.of("role", "system", "content", "Sos un extractor de filtros inmobiliarios."),
                                    Map.of("role", "user", "content", prompt)
                            ),
                            "max_completion_tokens", 1000
                    ))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            String json = response.get("choices").get(0).get("message").get("content").asText();

            ObjectMapper mapper = new ObjectMapper();

            return mapper.readValue(json, PropertyFilterDTO.class);
        } catch (JsonProcessingException ex) {
            ex.printStackTrace();
            return new PropertyFilterDTO();
        } catch (WebClientResponseException e) {
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            return new PropertyFilterDTO();
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
