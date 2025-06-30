package pi.ms_users.dto.feign;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PropertyDTO {
    private Long id;
    private String title;
    private Float price;
    private String description;
    private LocalDateTime date;
    private String mainImage;
    private String status;
    private String operation;
    private String currency;
    private String neighborhood;
    private String type;
}
