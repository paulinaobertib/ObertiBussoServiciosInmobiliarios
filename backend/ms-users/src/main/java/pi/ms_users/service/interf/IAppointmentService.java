package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Appointment;
import pi.ms_users.domain.AppointmentStatus;

import java.util.List;

public interface IAppointmentService {
    ResponseEntity<?> create(Appointment appointment);

    ResponseEntity<?> delete(Long id);

    ResponseEntity<?> updateStatus(Long id, AppointmentStatus status, String address);

    ResponseEntity<?> findById(Long id);

    ResponseEntity<?> findAll();

    ResponseEntity<?> findByUserId(String userId);
}
