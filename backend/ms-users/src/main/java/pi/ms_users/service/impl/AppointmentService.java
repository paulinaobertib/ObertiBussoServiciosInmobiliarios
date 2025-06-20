package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.Appointment;
import pi.ms_users.domain.AppointmentStatus;
import pi.ms_users.domain.User;
import pi.ms_users.dto.EmailDTO;
import pi.ms_users.repository.IAppointmentRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.IAppointmentService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService implements IAppointmentService {

    private final IAppointmentRepository appointmentRepository;

    private final IUserRepository userRepository;

    private final EmailService emailService;

    @Override
    public ResponseEntity<Appointment> create(Appointment appointment) {
        User user = userRepository.findById(appointment.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el usuario"));

        Appointment saved = appointmentRepository.save(appointment);

        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setTo(user.getEmail());
        emailDTO.setTitle("Solicitud de turno");
        emailDTO.setDescription("Gracias por solicitar un turno. Recibirás una confirmación por este medio.");
        emailDTO.setPhone(user.getPhone());
        emailDTO.setFirstName(user.getFirstName());
        emailDTO.setLastName(user.getLastName());
        emailDTO.setDate(appointment.getDate());

        emailService.sendAppointmentRequest(emailDTO);

        return ResponseEntity.ok(saved);
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el turno"));

        if (SecurityUtils.isUser() &&
                !appointment.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        appointmentRepository.delete(appointment);

        User user = userRepository.findById(appointment.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el usuario"));

        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setFirstName(user.getFirstName());
        emailDTO.setLastName(user.getLastName());
        emailDTO.setPhone(user.getPhone());
        emailDTO.setTo(user.getEmail());
        emailDTO.setDate(appointment.getDate());

        emailService.sendAppointmentCancelledMail(emailDTO);

        return ResponseEntity.ok("Se ha eliminado el turno");
    }

    @Override
    public ResponseEntity<String> updateStatus(Long id, AppointmentStatus status, String address) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el turno"));

        appointment.setStatus(status);

        User user = userRepository.findById(appointment.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado al usuario"));

        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setTo(user.getEmail());
        emailDTO.setFirstName(user.getFirstName());
        emailDTO.setDate(appointment.getDate());

        if (status == AppointmentStatus.ACEPTADO) {
            emailService.sendAppointmentDecisionToClient(emailDTO.getTo(), true, user.getFirstName(), appointment.getDate(), address);
        } else if (status == AppointmentStatus.RECHAZADO) {
            emailService.sendAppointmentDecisionToClient(emailDTO.getTo(), false, user.getFirstName(), appointment.getDate(), null);
        }

        return ResponseEntity.ok("Se ha actualizado el estado del turno");
    }

    @Override
    public ResponseEntity<Appointment> findById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el turno"));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !appointment.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        return ResponseEntity.ok(appointment);
    }

    @Override
    public ResponseEntity<List<Appointment>> findAll() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return ResponseEntity.ok(appointments);
    }

    @Override
    public ResponseEntity<List<Appointment>> findByUserId(String userId) {
        List<Appointment> appointments = appointmentRepository.findByUserId(userId);

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !userId.equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        return ResponseEntity.ok(appointments);
    }
}
