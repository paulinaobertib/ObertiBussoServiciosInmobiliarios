package pi.ms_users.controller;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.Appointment;
import pi.ms_users.domain.AppointmentStatus;
import pi.ms_users.service.interf.IAppointmentService;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final IAppointmentService appointmentService;

    @PostMapping("/create")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) throws MessagingException {
        return appointmentService.create(appointment);
    }

    @PreAuthorize("hasRole('user') and !hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteAppointment(@PathVariable Long id) {
        return appointmentService.delete(id);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/status/{id}")
    public ResponseEntity<String> updateAppointmentStatus(@PathVariable Long id, @RequestParam AppointmentStatus status, @RequestParam(required = false) String address) {
        return appointmentService.updateStatus(id, status, address);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return appointmentService.findById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return appointmentService.findAll();
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByUserId(@PathVariable String userId) {
        return appointmentService.findByUserId(userId);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/status")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@RequestParam("status") AppointmentStatus status) {
        return appointmentService.findByStatus(status);
    }
}

