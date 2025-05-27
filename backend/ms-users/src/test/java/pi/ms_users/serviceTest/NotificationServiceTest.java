package pi.ms_users.serviceTest;

import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_users.configuration.components.AppProperties;
import pi.ms_users.domain.Notification;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.User;
import pi.ms_users.domain.feign.Property;
import pi.ms_users.dto.EmailPropertyDTO;
import pi.ms_users.dto.NotificationDTO;
import pi.ms_users.repository.INotificationRepository;
import pi.ms_users.repository.IUserNotificationPreferenceRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.service.impl.NotificationService;
import pi.ms_users.service.interf.IEmailService;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private AppProperties appProperties;

    @Mock
    private INotificationRepository notificationRepository;

    @Mock
    private IUserNotificationPreferenceRepository userNotificationPreferenceRepository;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private IEmailService emailService;

    @Mock
    private PropertyRepository propertyRepository;

    @InjectMocks
    private NotificationService notificationService;

    // casos de exito

    @Test
    void createProperty_shouldSendNotificationsSuccessfully() {
        NotificationDTO dto = new NotificationDTO();
        dto.setType(NotificationType.PROPIEDADNUEVA);
        dto.setDate(LocalDateTime.now());

        String userId = "user123";
        Long propertyId = 1L;

        Property property = new Property();
        property.setId(propertyId);
        property.setTitle("Casa en Palermo");
        property.setPrice(250000f);
        property.setDescription("Amplia casa con jardín");
        property.setMainImage("img.jpg");
        property.setNeighborhood("Palermo");
        property.setOperation("VENTA");
        property.setCurrency("USD");
        property.setType("CASA");

        User user = new User();
        user.setId(userId);
        user.setMail("user@mail.com");

        when(userNotificationPreferenceRepository.usersIdByTypeTrue(dto.getType()))
                .thenReturn(List.of(userId));
        when(propertyRepository.getById(propertyId)).thenReturn(property);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(appProperties.getFrontendBaseUrl()).thenReturn("https://frontend.com");

        ResponseEntity<String> response = notificationService.createProperty(dto, propertyId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se han enviado las notificaciones correctamente", response.getBody());
        verify(emailService).sendNotificationNewProperty(any(EmailPropertyDTO.class));
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getById_shouldReturnNotification_whenExists() {
        Notification notification = new Notification();
        notification.setId(1L);

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        ResponseEntity<Notification> response = notificationService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(notification, response.getBody());
    }

    @Test
    void getAll_shouldReturnNotifications() {
        List<Notification> notifications = List.of(new Notification(), new Notification());

        when(notificationRepository.findAll()).thenReturn(notifications);

        ResponseEntity<List<Notification>> response = notificationService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(notifications, response.getBody());
    }

    @Test
    void getByUserId_shouldReturnNotifications_whenUserExists() {
        String userId = "user1";
        User user = new User();
        user.setId(userId);

        List<Notification> notifications = List.of(new Notification());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserId(userId)).thenReturn(notifications);

        ResponseEntity<List<Notification>> response = notificationService.getByUserId(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(notifications, response.getBody());
    }

    // casos de error

    @Test
    void createProperty_shouldReturnBadRequest_ifWrongType() {
        NotificationDTO dto = new NotificationDTO();
        dto.setType(NotificationType.ALQUILER);
        dto.setDate(LocalDateTime.now());

        ResponseEntity<String> response = notificationService.createProperty(dto, 1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("Endpoint incorrecto"));
    }

    @Test
    void createProperty_shouldReturnBadRequest_ifNoSubscribers() {
        NotificationDTO dto = new NotificationDTO();
        dto.setType(NotificationType.PROPIEDADNUEVA);
        dto.setDate(LocalDateTime.now());

        when(userNotificationPreferenceRepository.usersIdByTypeTrue(dto.getType()))
                .thenReturn(Collections.emptyList());

        ResponseEntity<String> response = notificationService.createProperty(dto, 1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("No hay usuarios suscriptos"));
    }

    @Test
    void createProperty_shouldReturnBadRequest_ifUserNotFound() {
        NotificationDTO dto = new NotificationDTO();
        dto.setType(NotificationType.PROPIEDADNUEVA);
        dto.setDate(LocalDateTime.now());

        String userId = "noExist";
        when(userNotificationPreferenceRepository.usersIdByTypeTrue(dto.getType()))
                .thenReturn(List.of(userId));
        when(propertyRepository.getById(1L)).thenReturn(new Property());
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        ResponseEntity<String> response = notificationService.createProperty(dto, 1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("no existe"));
    }

    @Test
    void getById_shouldReturnNotFound_whenNotExists() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<Notification> response = notificationService.getById(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getAll_shouldReturnInternalServerError_onException() {
        when(notificationRepository.findAll()).thenThrow(new RuntimeException("Error"));

        ResponseEntity<List<Notification>> response = notificationService.getAll();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByUserId_shouldReturnNotFound_whenUserRepositoryThrowsNotFoundException() {
        when(userRepository.findById("missing")).thenThrow(new NotFoundException("Not found"));

        ResponseEntity<List<Notification>> response = notificationService.getByUserId("missing");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getByUserId_shouldReturnInternalServerError_onUnexpectedError() {
        when(userRepository.findById("any")).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<List<Notification>> response = notificationService.getByUserId("any");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByUserId_shouldReturnInternalServerErrorOnUnexpectedException() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(notificationRepository.findByUserId("user123"))
                .thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<List<Notification>> response = notificationService.getByUserId("user123");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByUserId_shouldReturnBadRequestOnDataIntegrityViolation() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(notificationRepository.findByUserId("user123"))
                .thenThrow(new DataIntegrityViolationException("Violation"));

        ResponseEntity<List<Notification>> response = notificationService.getByUserId("user123");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getAll_shouldReturnInternalServerErrorOnUnexpectedException() {
        when(notificationRepository.findAll())
                .thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<List<Notification>> response = notificationService.getAll();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getAll_shouldReturnBadRequestOnDataIntegrityViolation() {
        when(notificationRepository.findAll())
                .thenThrow(new DataIntegrityViolationException("Violation"));

        ResponseEntity<List<Notification>> response = notificationService.getAll();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnInternalServerErrorOnUnexpectedException() {
        when(notificationRepository.findById(1L))
                .thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<Notification> response = notificationService.getById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnBadRequestOnDataIntegrityViolation() {
        when(notificationRepository.findById(1L))
                .thenThrow(new DataIntegrityViolationException("Constraint"));

        ResponseEntity<Notification> response = notificationService.getById(1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void createProperty_shouldReturnInternalServerErrorOnUnexpectedException() {
        NotificationDTO dto = new NotificationDTO();
        dto.setType(NotificationType.PROPIEDADNUEVA);
        when(userNotificationPreferenceRepository.usersIdByTypeTrue(NotificationType.PROPIEDADNUEVA))
                .thenThrow(new RuntimeException("Unexpected error"));

        ResponseEntity<String> response = notificationService.createProperty(dto, 1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void createProperty_shouldReturnBadRequestOnDataIntegrityViolation() {
        NotificationDTO dto = new NotificationDTO();
        dto.setType(NotificationType.PROPIEDADNUEVA);
        when(userNotificationPreferenceRepository.usersIdByTypeTrue(NotificationType.PROPIEDADNUEVA))
                    .thenThrow(new DataIntegrityViolationException("Constraint error"));

        ResponseEntity<String> response = notificationService.createProperty(dto, 1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}