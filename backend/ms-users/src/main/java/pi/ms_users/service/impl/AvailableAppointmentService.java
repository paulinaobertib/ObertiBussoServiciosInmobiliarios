package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.AvailableAppointment;
import pi.ms_users.dto.AvailableAppointmentDTO;
import pi.ms_users.repository.IAvailableAppointmentRepository;
import pi.ms_users.service.interf.IAvailableAppointmentService;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailableAppointmentService implements IAvailableAppointmentService {

    private final IAvailableAppointmentRepository availableAppointmentRepository;

    @Override
    public ResponseEntity<String> create(AvailableAppointmentDTO availableAppointmentDTO) {
        List<AvailableAppointment> availableAppointments = new ArrayList<>();

        LocalTime now = availableAppointmentDTO.getStartTime();
        while (!now.isAfter(availableAppointmentDTO.getEndTime().minusMinutes(30))) {
            LocalDateTime dateTime = LocalDateTime.of(availableAppointmentDTO.getDate(), now);
            AvailableAppointment availableAppointment = new AvailableAppointment();
            availableAppointment.setAvailability(true);
            availableAppointment.setDate(dateTime);
            availableAppointments.add(availableAppointment);
            now = now.plusMinutes(30);
        }

        availableAppointmentRepository.saveAll(availableAppointments);

        return ResponseEntity.ok("Se ha guardado la disponibilidad de turnos.");
    }

    @Override
    public ResponseEntity<String> updateAvailability(Long id) {
        AvailableAppointment availableAppointment = availableAppointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado disponibilidad."));

        availableAppointment.setAvailability(!availableAppointment.getAvailability());
        availableAppointmentRepository.save(availableAppointment);

        return ResponseEntity.ok("Disponibilidad actualizada.");
    }

    @Override
    public ResponseEntity<String> deleteAvailability(Long id) {
        AvailableAppointment availableAppointment = availableAppointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado disponibilidad."));

        availableAppointmentRepository.delete(availableAppointment);

        return ResponseEntity.ok("Se ha eliminado la disponibilidad.");
    }

    @Override
    public ResponseEntity<AvailableAppointment> getById(Long id) {
        AvailableAppointment availableAppointment = availableAppointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado disponibilidad."));

        return ResponseEntity.ok(availableAppointment);
    }

    @Override
    public ResponseEntity<List<AvailableAppointment>> getAll() {
        return ResponseEntity.ok(availableAppointmentRepository.findAll());
    }

    @Override
    public ResponseEntity<List<AvailableAppointment>> noAvailableAppointments() {
        return ResponseEntity.ok(availableAppointmentRepository.findFalseAvailability());
    }

    @Override
    public ResponseEntity<List<AvailableAppointment>> availableAppointments() {
        return ResponseEntity.ok(availableAppointmentRepository.findTrueAvailability());
    }
}
