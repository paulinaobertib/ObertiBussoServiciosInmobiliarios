package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.ms_users.domain.TenantPortalAccess;

public interface ITenantPortalAccessRepository extends JpaRepository<TenantPortalAccess, String> {
}
