package pi.ms_users.serviceTest;

import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.User;
import pi.ms_users.domain.UserNotificationPreference;
import pi.ms_users.repository.IUserNotificationPreferenceRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.impl.UserNotificationPreferenceService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserNotificationPreferenceServiceTest {

    @Mock
    private IUserNotificationPreferenceRepository preferenceRepository;

    @Mock
    private IUserRepository userRepository;

    @InjectMocks
    private UserNotificationPreferenceService service;

    private UserNotificationPreference defaultPreference;

    private UserNotificationPreference existingPreference;

    private UserNotificationPreference disabledPreference;

    @BeforeEach
    void setUp() {
        defaultPreference = new UserNotificationPreference();
        defaultPreference.setUserId("userTest");
        defaultPreference.setType(NotificationType.PROPIEDADNUEVA);
        defaultPreference.setEnabled(true);

        existingPreference = new UserNotificationPreference();
        existingPreference.setUserId("user2");
        existingPreference.setType(NotificationType.PROPIEDADNUEVA);
        existingPreference.setEnabled(false);

        disabledPreference = new UserNotificationPreference();
        disabledPreference.setUserId("userZ");
        disabledPreference.setType(NotificationType.PROPIEDADNUEVA);
        disabledPreference.setEnabled(false);
        disabledPreference.setId(10L);
    }

    // casos de exito

    @Test
    void create_shouldSaveNewPreference_whenUserValidAndNotExists() {
        when(userRepository.findById("userTest")).thenReturn(Optional.of(new User()));
        when(preferenceRepository.usersIdByType(NotificationType.PROPIEDADNUEVA)).thenReturn(List.of());
        when(preferenceRepository.usersIdByTypeTrue(NotificationType.PROPIEDADNUEVA)).thenReturn(List.of());

        ResponseEntity<String> response = service.create(defaultPreference);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(preferenceRepository).save(defaultPreference);
    }

    @Test
    void create_shouldEnableExistingFalsePreference() {
        when(userRepository.findById("user2")).thenReturn(Optional.of(new User()));
        when(preferenceRepository.usersIdByType(NotificationType.PROPIEDADNUEVA)).thenReturn(List.of("user2"));
        when(preferenceRepository.usersIdByTypeTrue(NotificationType.PROPIEDADNUEVA)).thenReturn(List.of());
        when(preferenceRepository.findByUserIdAndType("user2", NotificationType.PROPIEDADNUEVA)).thenReturn(existingPreference);

        UserNotificationPreference request = new UserNotificationPreference();
        request.setUserId("user2");
        request.setType(NotificationType.PROPIEDADNUEVA);
        request.setEnabled(true);

        ResponseEntity<String> response = service.create(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("Se ha guardado"));
        verify(preferenceRepository).save(existingPreference);
        assertTrue(existingPreference.getEnabled());
    }

    @Test
    void update_shouldModifyEnabled_whenIdExists() {
        when(preferenceRepository.findById(10L)).thenReturn(Optional.of(disabledPreference));

        ResponseEntity<String> response = service.update(10L, true);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(disabledPreference.getEnabled());
        verify(preferenceRepository).save(disabledPreference);
    }

    @Test
    void getById_shouldReturnPreference_whenExists() {
        when(preferenceRepository.findById(1L)).thenReturn(Optional.of(defaultPreference));

        ResponseEntity<UserNotificationPreference> response = service.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(defaultPreference, response.getBody());
    }

    @Test
    void getByUser_shouldReturnList_whenUserExists() {
        String userId = "userX";
        List<UserNotificationPreference> list = List.of(defaultPreference);

        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        when(preferenceRepository.findByUserId(userId)).thenReturn(list);

        ResponseEntity<List<UserNotificationPreference>> response = service.getByUser(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(list, response.getBody());
    }

    @Test
    void getByTypeAndTrue_shouldReturnList() {
        List<String> users = List.of("user1", "user2");
        when(preferenceRepository.usersIdByTypeTrue(NotificationType.PROPIEDADNUEVA)).thenReturn(users);

        ResponseEntity<List<String>> response = service.getByTypeAndTrue(NotificationType.PROPIEDADNUEVA);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(users, response.getBody());
    }

    // casos de error

    @Test
    void create_shouldReturnBadRequest_whenPreferenceAlreadyTrue() {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("user3");
        pref.setType(NotificationType.PROPIEDADNUEVA);
        pref.setEnabled(true);

        when(userRepository.findById("user3")).thenReturn(Optional.of(new User()));
        when(preferenceRepository.usersIdByType(pref.getType())).thenReturn(List.of());
        when(preferenceRepository.usersIdByTypeTrue(pref.getType())).thenReturn(List.of("user3"));

        ResponseEntity<String> response = service.create(pref);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("ya esta guardado"));
        verify(preferenceRepository, never()).save(any());
    }

    @Test
    void create_shouldReturnNotFound_whenUserNotFound() {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("missingUser");
        pref.setType(NotificationType.PROPIEDADNUEVA);
        pref.setEnabled(true);

        when(userRepository.findById("missingUser")).thenThrow(new NotFoundException("No existe"));

        ResponseEntity<String> response = service.create(pref);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void create_shouldReturnBadRequest_whenInvalidNotificationType() {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("userX");
        pref.setType(null);
        pref.setEnabled(true);

        when(userRepository.findById("userX")).thenReturn(Optional.of(new User()));

        ResponseEntity<String> response = service.create(pref);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("Tipo de notificación invalido"));
    }

    @Test
    void create_shouldReturnInternalServerError_onUnexpectedException() {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("userY");
        pref.setType(NotificationType.PROPIEDADNUEVA);
        pref.setEnabled(true);

        when(userRepository.findById("userY")).thenThrow(new RuntimeException("DB Error"));

        ResponseEntity<String> response = service.create(pref);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void update_shouldReturnNotFound_whenIdMissing() {
        when(preferenceRepository.findById(404L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = service.update(404L, true);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void update_shouldReturnInternalServerError_onException() {
        when(preferenceRepository.findById(1L)).thenThrow(new RuntimeException("error"));

        ResponseEntity<String> response = service.update(1L, true);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnNotFound_whenMissing() {
        when(preferenceRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<UserNotificationPreference> response = service.getById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnInternalServerError_onException() {
        when(preferenceRepository.findById(1L)).thenThrow(new RuntimeException());

        ResponseEntity<UserNotificationPreference> response = service.getById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByUser_shouldReturnNotFound_whenUserMissing() {
        when(userRepository.findById("unknown")).thenThrow(new NotFoundException("not found"));

        ResponseEntity<List<UserNotificationPreference>> response = service.getByUser("unknown");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getByUser_shouldReturnInternalServerError_onException() {
        when(userRepository.findById("x")).thenThrow(new RuntimeException());

        ResponseEntity<List<UserNotificationPreference>> response = service.getByUser("x");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByTypeAndTrue_shouldReturnInternalServerError_onException() {
        when(preferenceRepository.usersIdByTypeTrue(NotificationType.PROPIEDADNUEVA)).thenThrow(new RuntimeException());

        ResponseEntity<List<String>> response = service.getByTypeAndTrue(NotificationType.PROPIEDADNUEVA);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void create_shouldReturnInternalServerErrorOnUnexpectedException() {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("user123");
        pref.setType(NotificationType.PROPIEDADNUEVA);

        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(preferenceRepository.usersIdByType(NotificationType.PROPIEDADNUEVA)).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<String> response = service.create(pref);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void update_shouldReturnInternalServerErrorOnUnexpectedException() {
        when(preferenceRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<String> response = service.update(1L, true);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnInternalServerErrorOnUnexpectedException() {
        when(preferenceRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<UserNotificationPreference> response = service.getById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByUser_shouldReturnInternalServerErrorOnUnexpectedException() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(preferenceRepository.findByUserId("user123")).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<List<UserNotificationPreference>> response = service.getByUser("user123");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void create_shouldReturnBadRequest_onDataIntegrityViolationException() {
        UserNotificationPreference preference = new UserNotificationPreference();
        preference.setUserId("user1");
        preference.setType(NotificationType.PROPIEDADNUEVA);

        when(userRepository.findById("user1")).thenThrow(new DataIntegrityViolationException("error"));

        ResponseEntity<String> response = service.create(preference);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void update_shouldReturnBadRequest_onDataIntegrityViolationException() {
        when(preferenceRepository.findById(1L))
                .thenThrow(new DataIntegrityViolationException("error"));

        ResponseEntity<String> response = service.update(1L, true);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnBadRequest_onDataIntegrityViolationException() {
        when(preferenceRepository.findById(1L))
                .thenThrow(new DataIntegrityViolationException("error"));

        ResponseEntity<UserNotificationPreference> response = service.getById(1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getByUser_shouldReturnBadRequest_onDataIntegrityViolationException() {
        when(userRepository.findById("user1")).thenThrow(new DataIntegrityViolationException("error"));

        ResponseEntity<List<UserNotificationPreference>> response = service.getByUser("user1");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
