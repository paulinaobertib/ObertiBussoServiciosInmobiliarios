package pi.ms_properties.dto.wasi;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WasiLocationMappingRequestDTO {
    private Long neighborhoodId;
    private Integer wasiCountryId;
    private Integer wasiRegionId;
    private Integer wasiCityId;
    private Integer wasiLocationId;
    private Integer wasiZoneId;
}
