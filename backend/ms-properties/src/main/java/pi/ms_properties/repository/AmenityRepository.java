package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Amenity;

import java.util.Optional;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    @Query("select a from Amenity a where a.name = ?1")
    Optional<Amenity> findByName(String name);
}
