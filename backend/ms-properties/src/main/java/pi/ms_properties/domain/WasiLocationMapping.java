package pi.ms_properties.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wasi_location_mapping")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasiLocationMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "neighborhood_id", nullable = false, unique = true)
    private Neighborhood neighborhood;

    @Column(name = "wasi_country_id", nullable = false)
    private Integer wasiCountryId;

    @Column(name = "wasi_region_id", nullable = false)
    private Integer wasiRegionId;

    @Column(name = "wasi_city_id", nullable = false)
    private Integer wasiCityId;

    @Column(name = "wasi_location_id")
    private Integer wasiLocationId;

    @Column(name = "wasi_zone_id")
    private Integer wasiZoneId;
}
