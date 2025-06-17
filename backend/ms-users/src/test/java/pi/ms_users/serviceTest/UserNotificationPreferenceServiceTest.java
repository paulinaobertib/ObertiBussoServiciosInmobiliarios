package pi.ms_users.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.User;
import pi.ms_users.domain.UserNotificationPreference;
import pi.ms_users.repository.IUserNotificationPreferenceRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.security.SecurityUtils;
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
    void create_shouldThrowBadRequest_whenPreferenceAlreadyTrue() {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("user3");
        pref.setType(NotificationType.PROPIEDADNUEVA);
        pref.setEnabled(true);

        when(userRepository.findById("user3")).thenReturn(Optional.of(new User()));
        when(preferenceRepository.usersIdByType(pref.getType())).thenReturn(List.of());
        when(preferenceRepository.usersIdByTypeTrue(pref.getType())).thenReturn(List.of("user3"));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.create(pref));
        assertTrue(ex.getMessage().contains("El usuario ya está guardado con la preferencia en este tipo de notificación."));
        verify(preferenceRepository, never()).save(any());
    }

    @Test
    void create_shouldThrowNotFound_whenUserNotFound() {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("missingUser");
        pref.setType(NotificationType.PROPIEDADNUEVA);
        pref.setEnabled(true);

        when(userRepository.findById("missingUser")).thenThrow(new NotFoundException("No existe"));

        NotFoundException ex = assertThrows(NotFoundException.class, () -> service.create(pref));
        assertEquals("No existe", ex.getMessage());
    }

    @Test
    void create_shouldThrowBadRequest_whenInvalidNotificationType() {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("userX");
        pref.setType(null);
        pref.setEnabled(true);

        when(userRepository.findById("userX")).thenReturn(Optional.of(new User()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.create(pref));
        System.out.println("Mensaje recibido: " + ex.getMessage());
        assertTrue(ex.getMessage().contains("Tipo de notificación inválido."));
    }

    @Test
    void create_shouldThrowRuntimeException_onUnexpectedException() {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("userY");
        pref.setType(NotificationType.PROPIEDADNUEVA);
        pref.setEnabled(true);

        when(userRepository.findById("userY")).thenThrow(new RuntimeException("DB Error"));

        assertThrows(RuntimeException.class, () -> service.create(pref));
    }

    @Test
    void update_shouldThrowNotFound_whenIdMissing() {
        when(preferenceRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.update(404L, true));
    }

    @Test
    void update_shouldThrowRuntimeException_onException() {
        when(preferenceRepository.findById(1L)).thenThrow(new RuntimeException("error"));

        assertThrows(RuntimeException.class, () -> service.update(1L, true));
    }

    @Test
    void getById_shouldThrowNotFound_whenMissing() {
        when(preferenceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void getById_shouldThrowRuntimeException_onException() {
        when(preferenceRepository.findById(1L)).thenThrow(new RuntimeException());

        assertThrows(RuntimeException.class, () -> service.getById(1L));
    }

    @Test
    void getByUser_shouldThrowNotFound_whenUserMissing() {
        when(userRepository.findById("unknown")).thenThrow(new NotFoundException("not found"));

        assertThrows(NotFoundException.class, () -> service.getByUser("unknown"));
    }

    @Test
    void getByUser_shouldThrowRuntimeException_onException() {
        when(userRepository.findById("x")).thenThrow(new RuntimeException());

        assertThrows(RuntimeException.class, () -> service.getByUser("x"));
    }

    @Test
    void getByTypeAndTrue_shouldThrowRuntimeException_onException() {
        when(preferenceRepository.usersIdByTypeTrue(NotificationType.PROPIEDADNUEVA))
                .thenThrow(new RuntimeException());

        assertThrows(RuntimeException.class, () -> service.getByTypeAndTrue(NotificationType.PROPIEDADNUEVA));
    }

    @Test
    void update_shouldThrowRuntimeException_onUnexpectedException() {
        when(preferenceRepository.findById(1L))
                .thenThrow(new RuntimeException("Unexpected"));

        assertThrows(RuntimeException.class, () -> service.update(1L, true));
    }

    @Test
    void getById_shouldThrowRuntimeException_onUnexpectedException() {
        when(preferenceRepository.findById(1L))
                .thenThrow(new RuntimeException("Unexpected"));

        assertThrows(RuntimeException.class, () -> service.getById(1L));
    }

    @Test
    void getByUser_shouldThrowRuntimeException_onUnexpectedException() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(preferenceRepository.findByUserId("user123"))
                .thenThrow(new RuntimeException("Unexpected"));

        assertThrows(RuntimeException.class, () -> service.getByUser("user123"));
    }

    @Test
    void create_shouldThrowDataIntegrityViolationException() {
        UserNotificationPreference preference = new UserNotificationPreference();
        preference.setUserId("user1");
        preference.setType(NotificationType.PROPIEDADNUEVA);

        when(userRepository.findById("user1"))
                .thenThrow(new DataIntegrityViolationException("error"));

        assertThrows(DataIntegrityViolationException.class, () -> service.create(preference));
    }

    @Test
    void update_shouldThrowDataIntegrityViolationException() {
        when(preferenceRepository.findById(1L))
                .thenThrow(new DataIntegrityViolationException("error"));

        assertThrows(DataIntegrityViolationException.class, () -> service.update(1L, true));
    }

    @Test
    void getById_shouldThrowDataIntegrityViolationException() {
        when(preferenceRepository.findById(1L))
                .thenThrow(new DataIntegrityViolationException("error"));

        assertThrows(DataIntegrityViolationException.class, () -> service.getById(1L));
    }

    @Test
    void getByUser_shouldThrowDataIntegrityViolationException() {
        when(userRepository.findById("user1"))
                .thenThrow(new DataIntegrityViolationException("error"));

        assertThrows(DataIntegrityViolationException.class, () -> service.getByUser("user1"));
    }

    @Test
    void create_shouldThrowAccessDeniedException_whenUserIsNotAdminAndNotOwner() {
        when(userRepository.findById("userTest")).thenReturn(Optional.of(new User()));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isAdmin).thenReturn(false);
            utilities.when(SecurityUtils::isUser).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("otroUsuario");

            assertThrows(AccessDeniedException.class, () -> service.create(defaultPreference));
        }
    }

    @Test
    void update_shouldThrowAccessDeniedException_whenUserIsNotAdminAndNotOwner() {
        when(preferenceRepository.findById(10L)).thenReturn(Optional.of(disabledPreference));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isAdmin).thenReturn(false);
            utilities.when(SecurityUtils::isUser).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("otroUsuario");

            assertThrows(AccessDeniedException.class, () -> service.update(10L, true));
        }
    }

    @Test
    void getById_shouldThrowAccessDeniedException_whenUserIsNotAdminAndNotOwner() {
        when(preferenceRepository.findById(10L)).thenReturn(Optional.of(disabledPreference));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isAdmin).thenReturn(false);
            utilities.when(SecurityUtils::isUser).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("otroUsuario");

            assertThrows(AccessDeniedException.class, () -> service.getById(10L));
        }
    }

    @Test
    void getByUser_shouldThrowAccessDeniedException_whenUserIsNotAdminAndNotOwner() {
        when(userRepository.findById("userTest")).thenReturn(Optional.of(new User()));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isAdmin).thenReturn(false);
            utilities.when(SecurityUtils::isUser).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("otroUsuario");

            assertThrows(AccessDeniedException.class, () -> service.getByUser("userTest"));
        }
    }
}
