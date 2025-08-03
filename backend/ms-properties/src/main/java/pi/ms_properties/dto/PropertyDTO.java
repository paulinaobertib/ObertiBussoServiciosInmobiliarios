package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.domain.Image;
import pi.ms_properties.domain.Type;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyDTO {
    private Long id;
    private String title;
    private String street;
    private String number;
    private Float rooms;
    private Float bathrooms;
    private Float bedrooms;
    private Float area;
    private Float coveredArea;
    private BigDecimal price;
    private Boolean showPrice;
    private BigDecimal expenses;
    private Boolean credit;
    private Boolean financing;
    private Boolean outstanding;
    private String description;
    private LocalDateTime date;
    private String mainImage;
    private String status;
    private String operation;
    private String currency;
    private NeighborhoodDTO neighborhood;
    private Type type;
    private Set<Amenity> amenities;
    private Set<Image> images;
}
