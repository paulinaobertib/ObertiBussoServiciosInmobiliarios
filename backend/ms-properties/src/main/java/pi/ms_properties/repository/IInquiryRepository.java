package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface IInquiryRepository extends JpaRepository<Inquiry, Long> {
    @Query("select i from Inquiry i where i.userId = ?1")
    List<Inquiry> getByUserId(String userId);

    @Query("select i from Inquiry i join i.properties p where p.id = :propertyId")
    List<Inquiry> getByPropertyId(@Param("propertyId") Long propertyId);

    @Query("select i from Inquiry i where i.status = ?1")
    List<Inquiry> getByStatus(InquiryStatus status);

    @Query("SELECT i.status, COUNT(i) FROM Inquiry i GROUP BY i.status")
    List<Object[]> countByStatus();

    @Query("SELECT FUNCTION('DATE_FORMAT', i.date, '%Y-%m'), COUNT(i) FROM Inquiry i GROUP BY FUNCTION('DATE_FORMAT', i.date, '%Y-%m')")
    List<Object[]> countPerMonth();

    @Query("SELECT p.title, COUNT(p) FROM Inquiry i JOIN i.properties p GROUP BY p.title ORDER BY COUNT(p) DESC")
    List<Object[]> countMostConsultedProperties();

    @Query("SELECT i FROM Inquiry i LEFT JOIN FETCH i.properties WHERE i.id = :id")
    Optional<Inquiry> findByIdWithProperties(@Param("id") Long id);

    @Query("SELECT DISTINCT i FROM Inquiry i LEFT JOIN FETCH i.properties")
    List<Inquiry> findAllWithProperties();
}
