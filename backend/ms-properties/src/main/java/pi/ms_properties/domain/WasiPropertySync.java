package pi.ms_properties.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "wasi_property_sync")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasiPropertySync {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", unique = true, nullable = true)
    private Property property;

    @Column(name = "wasi_property_id", nullable = false, unique = true)
    private Integer wasiPropertyId;

    @Column(name = "synced_at", nullable = false)
    private LocalDateTime syncedAt;

    @Column(name = "sync_portals", columnDefinition = "TEXT")
    private String syncPortalsJson;

    @Column(name = "publish_to_wasi", nullable = false)
    private boolean publishToWasi;
}
