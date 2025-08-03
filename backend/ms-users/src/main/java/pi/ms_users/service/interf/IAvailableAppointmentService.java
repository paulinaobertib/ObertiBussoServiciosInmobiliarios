package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.AvailableAppointment;
import pi.ms_users.dto.AvailableAppointmentDTO;

import java.util.List;

public interface IAvailableAppointmentService {
    ResponseEntity<String> create(AvailableAppointmentDTO availableAppointmentDTO);

    ResponseEntity<String> updateAvailability(Long id);

    ResponseEntity<String> deleteAvailability(Long id);

    ResponseEntity<AvailableAppointment> getById(Long id);

    ResponseEntity<List<AvailableAppointment>> getAll();

    ResponseEntity<List<AvailableAppointment>> noAvailableAppointments();

    ResponseEntity<List<AvailableAppointment>> availableAppointments();
}
