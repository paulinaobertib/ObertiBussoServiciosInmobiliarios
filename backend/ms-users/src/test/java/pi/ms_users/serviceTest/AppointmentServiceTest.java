package pi.ms_users.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Appointment;
import pi.ms_users.domain.AppointmentStatus;
import pi.ms_users.domain.User;
import pi.ms_users.dto.EmailDTO;
import pi.ms_users.repository.IAppointmentRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.impl.AppointmentService;
import pi.ms_users.service.impl.EmailService;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @InjectMocks
    private AppointmentService appointmentService;

    @Mock
    private IAppointmentRepository appointmentRepository;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private EmailService emailService;

    // casos de exito

    @Test
    void create_success() {
        Appointment appointment = new Appointment();
        appointment.setUserId("user123");
        appointment.setDate(LocalDateTime.now());
        appointment.setStatus(AppointmentStatus.ESPERA);

        User user = new User();
        user.setMail("user@mail.com");
        user.setPhone("123");
        user.setFirstName("Ana");
        user.setLastName("Perez");

        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        ResponseEntity<Appointment> response = appointmentService.create(appointment);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(appointment, response.getBody());
        verify(emailService).sendAppointmentRequest(any(EmailDTO.class));
    }

    @Test
    void delete_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        appointment.setDate(LocalDateTime.now());

        User user = new User();
        user.setMail("mail@mail.com");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        ResponseEntity<String> response = appointmentService.delete(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado el turno", response.getBody());
        verify(emailService).sendAppointmentCancelledMail(any(EmailDTO.class));
        verify(appointmentRepository).delete(appointment);
    }

    @Test
    void updateStatus_aceptado_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        appointment.setDate(LocalDateTime.now());

        User user = new User();
        user.setMail("user@mail.com");
        user.setFirstName("Ana");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        ResponseEntity<String> response = appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO, "Address");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha actualizado el estado del turno", response.getBody());
        verify(emailService).sendAppointmentDecisionToClient(user.getMail(), true, "Ana", appointment.getDate(), "Address");
    }

    @Test
    void updateStatus_rechazado_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        appointment.setDate(LocalDateTime.now());

        User user = new User();
        user.setMail("user@mail.com");
        user.setFirstName("Ana");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        ResponseEntity<String> response = appointmentService.updateStatus(1L, AppointmentStatus.RECHAZADO, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(emailService).sendAppointmentDecisionToClient(user.getMail(), false, "Ana", appointment.getDate(), null);
    }

    @Test
    void findById_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        ResponseEntity<Appointment> response = appointmentService.findById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(appointment, response.getBody());
    }

    @Test
    void findAll_success() {
        List<Appointment> appointments = List.of(new Appointment());

        when(appointmentRepository.findAll()).thenReturn(appointments);

        ResponseEntity<List<Appointment>> response = appointmentService.findAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(appointments, response.getBody());
    }

    @Test
    void findByUserId_success() {
        List<Appointment> appointments = List.of(new Appointment());

        when(appointmentRepository.findByUserId("user123")).thenReturn(appointments);

        ResponseEntity<List<Appointment>> response = appointmentService.findByUserId("user123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(appointments, response.getBody());
    }

    // casos de error

    @Test
    void create_userNotFound_shouldThrowNoSuchElementException() {
        Appointment appointment = new Appointment();
        appointment.setUserId("user123");

        when(userRepository.findById("user123")).thenThrow(new NoSuchElementException("User not found"));

        assertThrows(NoSuchElementException.class, () -> appointmentService.create(appointment));
    }

    @Test
    void create_shouldThrowEntityNotFoundException() {
        Appointment appointment = new Appointment();
        appointment.setUserId("user123");

        when(userRepository.findById("user123")).thenThrow(new EntityNotFoundException("User not found"));

        assertThrows(EntityNotFoundException.class, () -> appointmentService.create(appointment));
    }

    @Test
    void create_generalException_shouldThrowRuntimeException() {
        Appointment appointment = new Appointment();
        appointment.setUserId("user123");

        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(appointmentRepository.save(appointment)).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class, () -> appointmentService.create(appointment));
    }

    @Test
    void delete_notFound_shouldThrowNoSuchElementException() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> appointmentService.delete(1L));
    }

    @Test
    void delete_generalException_shouldThrowRuntimeException() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        doThrow(new RuntimeException("error")).when(appointmentRepository).delete(appointment);

        assertThrows(RuntimeException.class, () -> appointmentService.delete(1L));
    }

    @Test
    void updateStatus_appointmentNotFound_shouldThrowNoSuchElementException() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
                appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO, "Address"));
    }

    @Test
    void updateStatus_userNotFound_shouldThrowNoSuchElementException() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
                appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO, "Address"));
    }

    @Test
    void updateStatus_generalException_shouldThrowRuntimeException() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class, () ->
                appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO, "Address"));
    }

    @Test
    void findById_notFound_shouldThrowNoSuchElementException() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> appointmentService.findById(1L));
    }

    @Test
    void findById_generalException_shouldThrowRuntimeException() {
        when(appointmentRepository.findById(1L)).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class, () -> appointmentService.findById(1L));
    }

    @Test
    void findAll_generalException_shouldThrowRuntimeException() {
        when(appointmentRepository.findAll()).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class, () -> appointmentService.findAll());
    }

    @Test
    void findByUserId_generalException_shouldThrowRuntimeException() {
        when(appointmentRepository.findByUserId("user123")).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class, () -> appointmentService.findByUserId("user123"));
    }

}

