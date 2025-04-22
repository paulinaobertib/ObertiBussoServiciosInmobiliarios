package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyDTO {
    private String title;
    private String street;
    private String number;
    private Float rooms;
    private Float bathrooms;
    private Float bedrooms;
    private Float area;
    private Float price;
    private String description;
    private LocalDateTime date;
    private String mainImage;
    private String status;
    private String operation;
    private String currency;
    private String neighborhoodName;
    private String neighborhoodType;
    private String type;
    private List<String> amenities;
    private List<String> images;
}
