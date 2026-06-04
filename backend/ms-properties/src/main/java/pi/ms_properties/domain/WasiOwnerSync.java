package pi.ms_properties.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "wasi_owner_sync")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasiOwnerSync {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", unique = true, nullable = true)
    private Owner owner;

    @Column(name = "wasi_client_id", nullable = false, unique = true)
    private Integer wasiClientId;

    @Column(name = "synced_at", nullable = false)
    private LocalDateTime syncedAt;
}
