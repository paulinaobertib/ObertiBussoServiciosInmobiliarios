package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NeighborhoodGetDTO {
    private Long id;
    private String name;
    private String type;
    private String city;
    private Double latitude;
    private Double longitude;
}
