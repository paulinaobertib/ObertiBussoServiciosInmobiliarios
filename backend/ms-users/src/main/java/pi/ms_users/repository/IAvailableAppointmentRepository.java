package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.AvailableAppointment;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IAvailableAppointmentRepository extends JpaRepository<AvailableAppointment, Long> {
    @Query("select aa from AvailableAppointment aa where aa.availability = true")
    List<AvailableAppointment> findTrueAvailability();

    @Query("select aa from AvailableAppointment aa where aa.availability = false")
    List<AvailableAppointment> findFalseAvailability();

    @Query("select aa from AvailableAppointment aa where aa.date in :dates")
    List<AvailableAppointment> findByDateIn(List<LocalDateTime> dates);

    @Query("SELECT a FROM AvailableAppointment a WHERE a.date > :now")
    List<AvailableAppointment> findAllFromNow(@Param("now") LocalDateTime now);
}
