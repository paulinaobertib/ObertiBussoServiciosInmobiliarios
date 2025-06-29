package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.AvailableAppointment;
import pi.ms_users.dto.AvailableAppointmentDTO;
import pi.ms_users.repository.IAvailableAppointmentRepository;
import pi.ms_users.service.interf.IAvailableAppointmentService;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailableAppointmentService implements IAvailableAppointmentService {

    private final IAvailableAppointmentRepository availableAppointmentRepository;

    @Override
    public ResponseEntity<String> create(AvailableAppointmentDTO availableAppointmentDTO) {
        if (!availableAppointmentDTO.getStartTime().isBefore(availableAppointmentDTO.getEndTime())) {
            return ResponseEntity.badRequest().body("El horario de inicio debe ser anterior al horario de fin.");
        }

        List<AvailableAppointment> availableAppointments = new ArrayList<>();

        List<LocalDateTime> requestedTimes = new ArrayList<>();
        LocalTime now = availableAppointmentDTO.getStartTime();
        while (!now.isAfter(availableAppointmentDTO.getEndTime().minusMinutes(30))) {
            requestedTimes.add(LocalDateTime.of(availableAppointmentDTO.getDate(), now));
            now = now.plusMinutes(30);
        }

        List<AvailableAppointment> existingAppointments = availableAppointmentRepository.findByDateIn(requestedTimes);

        Set<LocalDateTime> existingDates = existingAppointments.stream()
                        .map(AvailableAppointment::getDate)
                        .collect(Collectors.toSet());

        for(LocalDateTime dateTime : requestedTimes) {
            if (!existingDates.contains(dateTime)) {
                AvailableAppointment availableAppointment = new AvailableAppointment();
                availableAppointment.setAvailability(true);
                availableAppointment.setDate(dateTime);
                availableAppointments.add(availableAppointment);
            }
        }

        int newAppointments = availableAppointments.size();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        List<String> newAppointmentsForm = availableAppointments.stream()
                .map(app -> app.getDate().format(formatter))
                .toList();

        int existingAppointmentsDates = existingDates.size();

        if (newAppointments > 0) {
            availableAppointmentRepository.saveAll(availableAppointments);
        }

        if (existingAppointmentsDates > 0 && newAppointments > 0) {
            return ResponseEntity.ok("Turnos ya existentes: " + existingAppointmentsDates + ". Turnos nuevos guardados: " + newAppointments + ": " + newAppointmentsForm);
        } else if (existingAppointmentsDates == 0 && newAppointments > 0) {
            return ResponseEntity.ok("Se han guardado los nuevos turnos.");
        } else if (newAppointments == 0 && existingAppointmentsDates > 0) {
            return ResponseEntity.ok("Los turnos ya existian.");
        } else {
            return ResponseEntity.ok("No se generaron turnos. Verifique el rango de horario.");
        }
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