package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.ms_properties.domain.WasiLocationMapping;

import java.util.Optional;

public interface IWasiLocationMappingRepository extends JpaRepository<WasiLocationMapping, Long> {

    Optional<WasiLocationMapping> findByNeighborhood_Id(Long neighborhoodId);
}
