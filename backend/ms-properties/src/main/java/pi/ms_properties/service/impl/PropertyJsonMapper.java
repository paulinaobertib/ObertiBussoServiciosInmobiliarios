package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.dto.PropertyAIDTO;

@Service
@RequiredArgsConstructor
public class PropertyJsonMapper {

    private final ObjectMapper objectMapper;

    public String toJson(Property p) {
        try {
            PropertyAIDTO dto = toDto(p);
            return objectMapper.writeValueAsString(dto);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo convertir la propiedad a JSON", e);
        }
    }

    public PropertyAIDTO toDto(Property p) {

        PropertyAIDTO.Neighborhood neighborhood = new PropertyAIDTO.Neighborhood(
                p.getNeighborhood().getId(),
                p.getNeighborhood().getName(),
                p.getNeighborhood().getCity(),
                p.getNeighborhood().getLatitude(),
                p.getNeighborhood().getLongitude(),
                p.getNeighborhood().getType().toString()
        );

        PropertyAIDTO.Type type = new PropertyAIDTO.Type(
                p.getType().getId(),
                p.getType().getName(),
                p.getType().getHasBathrooms(),
                p.getType().getHasBedrooms(),
                p.getType().getHasCoveredArea(),
                p.getType().getHasRooms()
        );

        return new PropertyAIDTO(
                p.getId(),
                p.getArea(),
                p.getBathrooms(),
                p.getBedrooms(),
                p.getCoveredArea(),
                p.getCredit(),
                p.getCurrency().toString(),
                p.getDate() != null ? p.getDate().toString() : null,
                p.getDescription(),
                p.getExpenses() != null ? p.getExpenses().doubleValue() : null,
                p.getFinancing(),
                p.getNumber(),
                p.getLatitude(),
                p.getLongitude(),
                p.getOperation().toString(),
                p.getOutstanding(),
                p.getPrice().doubleValue(),
                p.getRooms(),
                p.getShowPrice(),
                p.getStatus().toString(),
                p.getStreet(),
                p.getTitle(),
                neighborhood,
                p.getOwner() != null ? p.getOwner().getId() : null,
                type,
                p.getAmenities().stream().map(Amenity::getName).toList()
        );
    }
}