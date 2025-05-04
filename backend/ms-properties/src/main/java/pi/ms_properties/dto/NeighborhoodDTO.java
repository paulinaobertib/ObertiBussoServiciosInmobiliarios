package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NeighborhoodDTO {
    private Long id;
    private String name;
    private String type;
    private String city;
}
