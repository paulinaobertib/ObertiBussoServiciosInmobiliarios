package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.ChatSession;

import java.util.List;

@Repository
public interface IChatSessionRepository extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByPropertyId(Long propertyId);

    @Query("SELECT cs.id FROM ChatSession cs WHERE cs.property.id = :propertyId")
    List<Long> findIdsByPropertyId(@Param("propertyId") Long propertyId);

    @Modifying
    @Query("DELETE FROM ChatSession cs WHERE cs.property.id = :propertyId")
    void deleteAllByPropertyId(@Param("propertyId") Long propertyId);
}
