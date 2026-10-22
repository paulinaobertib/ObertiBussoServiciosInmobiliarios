package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// que secciones del portal puede ver un inquilino (si no hay fila, puede ver ambas)
@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Tenant_Portal_Access")
public class TenantPortalAccess {
    @Id
    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(name = "can_view_contracts", nullable = false)
    private boolean canViewContracts = true;

    @Column(name = "can_view_receipts", nullable = false)
    private boolean canViewReceipts = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
