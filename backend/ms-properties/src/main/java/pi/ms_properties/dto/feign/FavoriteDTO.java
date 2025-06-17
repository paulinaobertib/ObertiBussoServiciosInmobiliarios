package pi.ms_properties.dto.feign;

import lombok.Data;

@Data
public class FavoriteDTO {
    private Long id;
    private String userId;
    private Long propertyId;
}
