package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.View;

@Repository
public interface IViewRepository extends JpaRepository<View, Long> {
    @Modifying
    @Query("DELETE FROM View v WHERE v.property.id = ?1")
    void deleteAllByPropertyId(@Param("propertyId") Long propertyId);
}