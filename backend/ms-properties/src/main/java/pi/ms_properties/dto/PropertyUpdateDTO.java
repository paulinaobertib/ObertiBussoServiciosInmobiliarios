package pi.ms_properties.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyUpdateDTO {
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
    private String status;
    private String propertyCondition;
    private String operation;
    private String rentsType;
    private String currency;
    private Boolean networkShare;
    private Boolean publishToWasi;
    private java.util.List<Integer> wasiPortalIds;
    @JsonIgnore
    private MultipartFile mainImageUpdated;
    private Long ownerId;
    private Long neighborhoodId;
    private Long typeId;
    private List<Long> amenitiesIds;
}
