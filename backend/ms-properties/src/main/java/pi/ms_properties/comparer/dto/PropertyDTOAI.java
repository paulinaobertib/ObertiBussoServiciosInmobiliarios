package pi.ms_properties.comparer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyDTOAI {
    private String address;
    private Double latitude;
    private Double longitude;
    private Float rooms;
    private Float bathrooms;
    private Float bedrooms;
    private Float area;
    private Float coveredArea;
    private Float price;
    private String operation;
    private String type;
    private Set<String> amenities;
}
