package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentDTO {
    private long id;
    private String description;
    private Long propertyId;
}
