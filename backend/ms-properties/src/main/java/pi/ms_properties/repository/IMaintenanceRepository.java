package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Maintenance;

import java.util.List;

@Repository
public interface IMaintenanceRepository extends JpaRepository<Maintenance, Long> {
    @Query("select m from Maintenance m where m.property.id = ?1")
    @EntityGraph(attributePaths = {"property"})
    List<Maintenance> findByPropertyId(Long id);
}
