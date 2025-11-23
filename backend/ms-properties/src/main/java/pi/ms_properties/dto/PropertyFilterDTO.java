package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyFilterDTO {
    private String street;
    private Float rooms;
    private Float bathrooms;
    private Float bedrooms;
    private Float area;
    private Float coveredArea;
    private BigDecimal price;
    private BigDecimal expenses;
    private String currency;
    private String operation;
    private String type;
    private String neighborhood;
    private Boolean credit;
    private Boolean financing;
    private Set<String> amenities;
}