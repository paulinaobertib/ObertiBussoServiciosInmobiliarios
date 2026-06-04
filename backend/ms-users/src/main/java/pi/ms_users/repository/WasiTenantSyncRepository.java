package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.ms_users.domain.WasiTenantSync;

import java.util.Optional;

public interface WasiTenantSyncRepository extends JpaRepository<WasiTenantSync, Long> {

    Optional<WasiTenantSync> findByUserId(String userId);
}
