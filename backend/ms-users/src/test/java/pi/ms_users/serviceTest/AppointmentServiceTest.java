package pi.ms_users.serviceTest;

import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import pi.ms_users.domain.Appointment;
import pi.ms_users.domain.AppointmentStatus;
import pi.ms_users.domain.AvailableAppointment;
import pi.ms_users.domain.User;
import pi.ms_users.dto.email.EmailDTO;
import pi.ms_users.repository.IAppointmentRepository;
import pi.ms_users.repository.IAvailableAppointmentRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.impl.AppointmentService;
import pi.ms_users.service.interf.IEmailService;

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
    private IEmailService emailService;

    @Mock
    private IAvailableAppointmentRepository availableAppointmentRepository;

    // casos de exito

    @Test
    void create_success() throws MessagingException {
        Appointment appointment = new Appointment();
        appointment.setUserId("user123");

        AvailableAppointment available = new AvailableAppointment();
        available.setId(10L);
        available.setAvailability(true);
        available.setDate(LocalDateTime.now());
        appointment.setAvailableAppointment(available);

        User user = new User();
        user.setEmail("user@mail.com");
        user.setPhone("123");
        user.setFirstName("Ana");
        user.setLastName("Perez");

        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(availableAppointmentRepository.findById(10L)).thenReturn(Optional.of(available));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        ResponseEntity<Appointment> response = appointmentService.create(appointment);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(appointment, response.getBody());
        verify(availableAppointmentRepository).save(any());
        verify(appointmentRepository).save(appointment);
        verify(emailService).sendAppointmentRequest(any(EmailDTO.class));
    }

    @Test
    void delete_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        AvailableAppointment available = new AvailableAppointment();
        available.setId(10L);
        available.setAvailability(false);
        available.setDate(LocalDateTime.now());
        appointment.setAvailableAppointment(available);

        User user = new User();
        user.setEmail("mail@mail.com");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(availableAppointmentRepository.findById(10L)).thenReturn(Optional.of(available));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isUser).thenReturn(false);

            ResponseEntity<String> response = appointmentService.delete(1L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals("Se ha eliminado el turno", response.getBody());
            verify(emailService).sendAppointmentCancelledMail(any(EmailDTO.class));
            verify(appointmentRepository).delete(appointment);
            verify(availableAppointmentRepository).save(any());
        }
    }

    @Test
    void updateStatus_aceptado_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        AvailableAppointment available = new AvailableAppointment();
        available.setId(10L);
        available.setDate(LocalDateTime.now());
        appointment.setAvailableAppointment(available);

        User user = new User();
        user.setEmail("user@mail.com");
        user.setFirstName("Ana");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(availableAppointmentRepository.findById(10L)).thenReturn(Optional.of(available));

        ResponseEntity<String> response = appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO, "Address");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha actualizado el estado del turno", response.getBody());
        verify(emailService).sendAppointmentDecisionToClient(appointment.getId(), user.getEmail(), true, user.getFirstName(), available.getDate(), "Address");
    }

    @Test
    void updateStatus_rechazado_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        AvailableAppointment available = new AvailableAppointment();
        available.setId(10L);
        available.setAvailability(false);
        available.setDate(LocalDateTime.now());
        appointment.setAvailableAppointment(available);

        User user = new User();
        user.setEmail("user@mail.com");
        user.setFirstName("Ana");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(availableAppointmentRepository.findById(10L)).thenReturn(Optional.of(available));

        ResponseEntity<String> response = appointmentService.updateStatus(1L, AppointmentStatus.RECHAZADO, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(availableAppointmentRepository).save(available);
        verify(emailService).sendAppointmentDecisionToClient(appointment.getId(), user.getEmail(), false, user.getFirstName(), available.getDate(), null);
    }

    @Test
    void updateStatus_cancelaTurnoPrevioAceptado_enviaEmailDisculpa() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        appointment.setStatus(AppointmentStatus.ACEPTADO);

        AvailableAppointment available = new AvailableAppointment();
        available.setId(10L);
        available.setAvailability(false);
        available.setDate(LocalDateTime.now());
        appointment.setAvailableAppointment(available);

        User user = new User();
        user.setEmail("user@mail.com");
        user.setFirstName("Ana");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(availableAppointmentRepository.findById(10L)).thenReturn(Optional.of(available));

        ResponseEntity<String> response = appointmentService.updateStatus(1L, AppointmentStatus.RECHAZADO, "Address");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha actualizado el estado del turno", response.getBody());

        assertEquals(AppointmentStatus.RECHAZADO, appointment.getStatus());

        verify(appointmentRepository).save(appointment);
        verify(availableAppointmentRepository).save(available);

        verify(emailService).sendApologyForCancelledAppointment(appointment.getId(), user.getEmail(), user.getFirstName(), available.getDate());
    }

    @Test
    void findById_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isAdmin).thenReturn(true);

            ResponseEntity<Appointment> response = appointmentService.findById(1L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(appointment, response.getBody());
        }
    }

    @Test
    void findAll_success() {
        List<Appointment> appointments = List.of(new Appointment());

        when(appointmentRepository.findAll()).thenReturn(appointments);

        ResponseEntity<List<Appointment>> response = appointmentService.findAll();

        assertEquals(appointments, response.getBody());
    }

    @Test
    void findByUserId_success() {
        List<Appointment> appointments = List.of(new Appointment());

        when(appointmentRepository.findByUserId("user123")).thenReturn(appointments);

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isAdmin).thenReturn(true);

            ResponseEntity<List<Appointment>> response = appointmentService.findByUserId("user123");

            assertEquals(appointments, response.getBody());
        }
    }

    @Test
    void findByStatus_success() {
        AppointmentStatus status = AppointmentStatus.ESPERA;

        Appointment a1 = new Appointment();
        a1.setId(1L);
        a1.setUserId("user1");
        a1.setStatus(status);

        Appointment a2 = new Appointment();
        a2.setId(2L);
        a2.setUserId("user2");
        a2.setStatus(status);

        List<Appointment> mockList = List.of(a1, a2);

        when(appointmentRepository.findByStatus(status)).thenReturn(mockList);

        ResponseEntity<List<Appointment>> response = appointmentService.findByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        assertEquals("user1", response.getBody().get(0).getUserId());
        assertEquals(status, response.getBody().get(1).getStatus());

        verify(appointmentRepository).findByStatus(status);
    }

    @Test
    void findByStatus_emptyList() {
        AppointmentStatus status = AppointmentStatus.RECHAZADO;

        when(appointmentRepository.findByStatus(status)).thenReturn(Collections.emptyList());

        ResponseEntity<List<Appointment>> response = appointmentService.findByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());

        verify(appointmentRepository).findByStatus(status);
    }

    // casos de error

    @Test
    void create_turnoNoDisponible_shouldThrowIllegalStateException() {
        Appointment appointment = new Appointment();
        appointment.setUserId("user123");

        AvailableAppointment unavailable = new AvailableAppointment();
        unavailable.setId(10L);
        unavailable.setAvailability(false);
        appointment.setAvailableAppointment(unavailable);

        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(availableAppointmentRepository.findById(10L)).thenReturn(Optional.of(unavailable));

        assertThrows(IllegalStateException.class, () -> appointmentService.create(appointment));
    }

    @Test
    void delete_withDifferentUser_throwsAccessDenied() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isUser).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> appointmentService.delete(1L));
        }
    }

    @Test
    void updateStatus_disponibilidadNoExiste_shouldThrowEntityNotFound() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        AvailableAppointment available = new AvailableAppointment();
        available.setId(10L);
        appointment.setAvailableAppointment(available);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(availableAppointmentRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
                appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO, "Address"));
    }

    @Test
    void findById_withDifferentUser_throwsAccessDenied() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isAdmin).thenReturn(false);
            securityMock.when(SecurityUtils::isUser).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> appointmentService.findById(1L));
        }
    }

    @Test
    void findByUserId_withDifferentUser_throwsAccessDenied() {
        when(appointmentRepository.findByUserId("user123")).thenReturn(List.of());

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isAdmin).thenReturn(false);
            securityMock.when(SecurityUtils::isUser).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> appointmentService.findByUserId("user123"));
        }
    }

    @Test
    void findByStatus_repositoryThrowsException() {
        AppointmentStatus status = AppointmentStatus.ACEPTADO;

        when(appointmentRepository.findByStatus(status))
                .thenThrow(new RuntimeException("Fallo en base de datos"));

        assertThrows(RuntimeException.class, () -> appointmentService.findByStatus(status));

        verify(appointmentRepository).findByStatus(status);
    }

    @Test
    void create_usuarioNoEncontrado_shouldThrowEntityNotFound() {
        Appointment appointment = new Appointment();
        appointment.setUserId("user123");
        AvailableAppointment available = new AvailableAppointment();
        available.setId(10L);
        appointment.setAvailableAppointment(available);

        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> appointmentService.create(appointment));
    }

    @Test
    void create_disponibilidadNoEncontrada_shouldThrowEntityNotFound() {
        Appointment appointment = new Appointment();
        appointment.setUserId("user123");
        AvailableAppointment available = new AvailableAppointment();
        available.setId(10L);
        appointment.setAvailableAppointment(available);

        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(availableAppointmentRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> appointmentService.create(appointment));
    }

    @Test
    void delete_turnoNoEncontrado_shouldThrowEntityNotFound() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> appointmentService.delete(1L));
    }

    @Test
    void delete_usuarioNoEncontrado_shouldThrowEntityNotFound() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        AvailableAppointment av = new AvailableAppointment();
        av.setId(10L);
        appointment.setAvailableAppointment(av);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> appointmentService.delete(1L));
    }

    @Test
    void delete_disponibilidadNoEncontrada_shouldThrowEntityNotFound() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        AvailableAppointment av = new AvailableAppointment();
        av.setId(10L);
        appointment.setAvailableAppointment(av);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(availableAppointmentRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> appointmentService.delete(1L));
    }

    @Test
    void updateStatus_turnoNoEncontrado_shouldThrowEntityNotFound() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO, "Address"));
    }

    @Test
    void updateStatus_usuarioNoEncontrado_shouldThrowEntityNotFound() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        AvailableAppointment av = new AvailableAppointment();
        av.setId(10L);
        appointment.setAvailableAppointment(av);

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO, "Address"));
    }

    @Test
    void findById_turnoNoEncontrado_shouldThrowEntityNotFound() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> appointmentService.findById(1L));
    }

}
