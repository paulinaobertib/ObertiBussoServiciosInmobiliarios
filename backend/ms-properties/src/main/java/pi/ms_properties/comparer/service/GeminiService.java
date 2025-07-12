package pi.ms_properties.comparer.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import pi.ms_properties.comparer.dto.PropertyDTOAI;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();

    public String compareProperties(List<PropertyDTOAI> properties) {
        String prompt = generatePrompt(properties);

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(Map.of("text", prompt))
                        )
                )
        );

        return webClient.post()
                .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(json -> json.at("/candidates/0/content/parts/0/text").asText())
                .block();
    }

    private String generatePrompt(List<PropertyDTOAI> properties) {
        StringBuilder sb = new StringBuilder(
                "Sos un asesor inmobiliario en Córdoba, Argentina. Compará estas propiedades en base a ubicación, precio, superficie, comodidades, y características generales:\n\n"
        );

        for (int i = 0; i < properties.size(); i++) {
            PropertyDTOAI p = properties.get(i);

            sb.append("Propiedad: ").append(p.getName() != null ? p.getName() : "Sin nombre").append("\n");
            sb.append(" - Dirección: ").append(p.getAddress()).append("\n");

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

        sb.append("Por favor, indicá los pros y contras de cada propiedad basándote en estos datos. Hacelo personal y amigable, para que el cliente se sienta cercano, sin usar negrita ni cursiva ni emojis. No mencionés negociar el precio. Limitá la respuesta a 1500 caracteres. Incluí recomendaciones sobre seguridad y tránsito en la zona, y un breve consejo. En todo esto, no incluyas la direccion exacta.");

        return sb.toString();
    }
}

