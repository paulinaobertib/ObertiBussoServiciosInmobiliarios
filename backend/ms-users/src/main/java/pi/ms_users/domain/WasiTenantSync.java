package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "wasi_tenant_sync")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasiTenantSync {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true, length = 255)
    private String userId;

    @Column(name = "wasi_client_id", nullable = false, unique = true)
    private Integer wasiClientId;

    @Column(name = "synced_at", nullable = false)
    private LocalDateTime syncedAt;
}
