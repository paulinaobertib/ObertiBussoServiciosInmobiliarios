package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MaintenanceDTO {
    private LocalDateTime date;
    private String title;
    private String description;
    private Long propertyId;
}
