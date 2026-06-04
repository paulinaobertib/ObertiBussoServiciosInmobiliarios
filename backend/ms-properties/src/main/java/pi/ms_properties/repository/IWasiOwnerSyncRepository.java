package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.ms_properties.domain.WasiOwnerSync;

import java.util.Optional;

public interface IWasiOwnerSyncRepository extends JpaRepository<WasiOwnerSync, Long> {

    Optional<WasiOwnerSync> findByOwner_Id(Long ownerId);
}
