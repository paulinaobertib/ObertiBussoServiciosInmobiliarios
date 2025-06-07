package pi.ms_properties.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Type")
public class Type {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "has_rooms", nullable = false)
    private Boolean hasRooms;

    @Column(name = "has_bathrooms", nullable = false)
    private Boolean hasBathrooms;

    @Column(name = "has_bedrooms", nullable = false)
    private Boolean hasBedrooms;

    @Column(name = "has_covered_area", nullable = false)
    private Boolean hasCoveredArea;
}
