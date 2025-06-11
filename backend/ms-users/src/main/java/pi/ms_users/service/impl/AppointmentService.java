package pi.ms_users.service.impl;

import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionSystemException;
import pi.ms_users.domain.Appointment;
import pi.ms_users.domain.AppointmentStatus;
import pi.ms_users.domain.User;
import pi.ms_users.dto.EmailDTO;
import pi.ms_users.repository.IAppointmentRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.interf.IAppointmentService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppointmentService implements IAppointmentService {

    private final IAppointmentRepository appointmentRepository;

    private final IUserRepository userRepository;

    private final EmailService emailService;

    @Override
    public ResponseEntity<?> create(Appointment appointment) {
        try {
            Optional<User> optionalUser;
            try {
                optionalUser = userRepository.findById(appointment.getUserId());
            } catch (NotFoundException e) {
                return ResponseEntity.notFound().build();
            }

            User user = optionalUser.get();

            Appointment saved = appointmentRepository.save(appointment);

            EmailDTO emailDTO = new EmailDTO();
            emailDTO.setTo(user.getMail());
            emailDTO.setTitle("Solicitud de turno");
            emailDTO.setDescription("Gracias por solicitar un turno. Recibirás una confirmación por este medio.");
            emailDTO.setPhone(user.getPhone());
            emailDTO.setFirstName(user.getFirstName());
            emailDTO.setLastName(user.getLastName());
            emailDTO.setDate(appointment.getDate());

            emailService.sendAppointmentRequest(emailDTO);

            return ResponseEntity.ok(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> delete(Long id) {
        try {
            Optional<Appointment> appointment = appointmentRepository.findById(id);
            if (appointment.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el turno");
            }
            appointmentRepository.delete(appointment.get());
            Optional<User> userOpt = userRepository.findById(appointment.get().getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                EmailDTO emailDTO = new EmailDTO();
                emailDTO.setFirstName(user.getFirstName());
                emailDTO.setLastName(user.getLastName());
                emailDTO.setPhone(user.getPhone());
                emailDTO.setTo(user.getMail());
                emailDTO.setDate(appointment.get().getDate());

                emailService.sendAppointmentCancelledMail(emailDTO);
            }
            return ResponseEntity.ok("Se ha eliminado el turno");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateStatus(Long id, AppointmentStatus status, String address) {
        try {
            Optional<Appointment> search = appointmentRepository.findById(id);
            if (search.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el turno");
            }

            Appointment appointment = search.get();
            appointment.setStatus(status);

            Optional<User> optionalUser = userRepository.findById(search.get().getUserId());

            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado al usuario");
            }

            User user = optionalUser.get();

            EmailDTO emailDTO = new EmailDTO();
            emailDTO.setTo(user.getMail());
            emailDTO.setFirstName(user.getFirstName());
            emailDTO.setDate(appointment.getDate());

            if (status == AppointmentStatus.ACEPTADO) {
                emailService.sendAppointmentDecisionToClient(emailDTO.getTo(), true, user.getFirstName(), appointment.getDate(), address);
            } else if (status == AppointmentStatus.RECHAZADO) {
                emailService.sendAppointmentDecisionToClient(emailDTO.getTo(), false, user.getFirstName(), appointment.getDate(), null);
            }

            return ResponseEntity.ok("Se ha actualizado el estado del turno");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> findById(Long id) {
        try {
            Optional<Appointment> search = appointmentRepository.findById(id);
            return search.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> findAll() {
        try {
            List<Appointment> appointments = appointmentRepository.findAll();
            return ResponseEntity.ok(appointments);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> findByUserId(String userId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByUserId(userId);
            return ResponseEntity.ok(appointments);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }
}
