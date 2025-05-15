package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Appointment;
import pi.ms_users.domain.AppointmentStatus;

import java.util.List;

public interface IAppointmentService {

    ResponseEntity<Appointment> create(Appointment appointment);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<String> updateStatus(Long id, AppointmentStatus status);

    ResponseEntity<Appointment> findById(Long id);

    ResponseEntity<List<Appointment>> findAll();

    ResponseEntity<List<Appointment>> findByUserId(String userId);
}
