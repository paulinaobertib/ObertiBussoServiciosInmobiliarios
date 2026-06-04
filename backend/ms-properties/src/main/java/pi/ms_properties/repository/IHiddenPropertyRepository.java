package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pi.ms_properties.domain.HiddenProperty;

import java.util.Set;

public interface IHiddenPropertyRepository extends JpaRepository<HiddenProperty, Long> {

    @Query("select h.propertyId from HiddenProperty h")
    Set<Long> findAllHiddenIds();
}
