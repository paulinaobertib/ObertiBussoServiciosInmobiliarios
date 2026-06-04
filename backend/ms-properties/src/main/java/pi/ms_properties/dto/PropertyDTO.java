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
    private Double latitude;
    private Double longitude;
    private Float rooms;
    private Float bathrooms;
    private Float bedrooms;
    private Integer garages;
    private Integer floor;
    private Float area;
    private Float coveredArea;
    private Float privateArea;
    private BigDecimal price;
    private Boolean showPrice;
    private BigDecimal expenses;
    private Boolean showExpenses;
    private Boolean credit;
    private Boolean financing;
    private Boolean outstanding;
    private String description;
    private String video;
    private String zipCode;
    private LocalDateTime date;
    private String mainImage;
    private String status;
    private String propertyCondition;
    private String operation;
    private String rentsType;
    private String currency;
    private Boolean networkShare;
    /** Si la propiedad se muestra al público. Solo se setea en respuestas de admin (default visible). */
    private Boolean visible;
    /** Admin-only: "propia" or allied company label */
    private String source;
    private Integer wasiId;
    private java.util.List<String> wasiPortals;
    private NeighborhoodDTO neighborhood;
    private Type type;
    private Set<Amenity> amenities;
    private Set<Image> images;
}
