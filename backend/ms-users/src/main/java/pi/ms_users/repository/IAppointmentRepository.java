package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.Appointment;

import java.util.List;

@Repository
public interface IAppointmentRepository extends JpaRepository<Appointment, Long> {
    @Query("select a from Appointment a where a.userId = ?1")
    List<Appointment> findByUserId(String userId);
}
