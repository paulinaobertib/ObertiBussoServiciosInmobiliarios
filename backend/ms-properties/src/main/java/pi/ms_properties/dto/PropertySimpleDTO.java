package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertySimpleDTO {
    private Long id;
    private String title;
    private BigDecimal price;
    private String description;
    private LocalDateTime date;
    private String mainImage;
    private String status;
    private String operation;
    private String currency;
    private String neighborhood;
    private String type;
}
