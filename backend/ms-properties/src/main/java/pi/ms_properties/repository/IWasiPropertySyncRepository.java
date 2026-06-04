package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.ms_properties.domain.WasiPropertySync;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface IWasiPropertySyncRepository extends JpaRepository<WasiPropertySync, Long> {

    Optional<WasiPropertySync> findByProperty_Id(Long propertyId);

    List<WasiPropertySync> findByWasiPropertyIdIn(Collection<Integer> wasiIds);

    boolean existsByWasiPropertyId(Integer wasiPropertyId);
}
