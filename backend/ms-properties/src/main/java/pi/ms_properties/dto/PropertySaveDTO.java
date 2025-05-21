package pi.ms_properties.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class PropertySaveDTO {
    private String title;
    private String street;
    private String number;
    private Float rooms;
    private Float bathrooms;
    private Float bedrooms;
    private Float area;
    private Float coveredArea;
    private Float price;
    private Boolean showPrice;
    private Float expenses;
    private Boolean credit;
    private Boolean financing;
    private String description;
    @JsonIgnore
    private MultipartFile mainImage;
    private String status;
    private String operation;
    private String currency;
    private Long ownerId;
    private Long neighborhoodId;
    private Long typeId;
    private List<Long> amenitiesIds;
    @JsonIgnore
    private List<MultipartFile> images;
}
