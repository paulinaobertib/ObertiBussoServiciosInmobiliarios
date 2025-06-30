package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Amenity;

@Repository
public interface IAmenityRepository extends JpaRepository<Amenity, Long> {
    boolean existsByName(String name);
}
