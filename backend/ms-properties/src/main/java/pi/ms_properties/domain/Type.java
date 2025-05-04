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
    private long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "hasRooms", nullable = false)
    private Boolean hasRooms;

    @Column(name = "hasBathrooms", nullable = false)
    private Boolean hasBathrooms;

    @Column(name = "hasBedrooms", nullable = false)
    private Boolean hasBedrooms;
}
