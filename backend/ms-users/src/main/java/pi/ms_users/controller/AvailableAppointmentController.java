package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.AvailableAppointment;
import pi.ms_users.dto.AvailableAppointmentDTO;
import pi.ms_users.service.interf.IAvailableAppointmentService;

import java.util.List;

@RestController
@RequestMapping("/availableAppointments")
@RequiredArgsConstructor
public class AvailableAppointmentController {

    private final IAvailableAppointmentService availableAppointmentService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody AvailableAppointmentDTO availableAppointmentDTO) {
        return availableAppointmentService.create(availableAppointmentDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @PatchMapping("/updateAvailability/{id}")
    public ResponseEntity<String> updateAvailability(@PathVariable Long id) {
        return availableAppointmentService.updateAvailability(id);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteAvailability(@PathVariable Long id) {
        return availableAppointmentService.deleteAvailability(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<AvailableAppointment> getById(@PathVariable Long id) {
        return availableAppointmentService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<AvailableAppointment>> getAll() {
        return availableAppointmentService.getAll();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/available")
    public ResponseEntity<List<AvailableAppointment>> getAvailable() {
        return availableAppointmentService.availableAppointments();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/unavailable")
    public ResponseEntity<List<AvailableAppointment>> getUnavailable() {
        return availableAppointmentService.noAvailableAppointments();
    }
}
