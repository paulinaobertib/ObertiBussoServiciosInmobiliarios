package pi.ms_users.serviceTest;

import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.User;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.impl.UserService;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private IUserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId("user123");
        user.setUsername("jdoe");
        user.setMail("jdoe@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPhone("1234567890");
    }

    // casos de exito

    @Test
    void findById_shouldReturnUser_whenFound() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        ResponseEntity<Optional<User>> response = userService.findById("user123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isPresent());
    }

    @Test
    void findAll_shouldReturnList_whenUsersExist() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        ResponseEntity<List<User>> response = userService.findAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void deleteUserById_shouldReturnOk_whenUserDeleted() {
        doNothing().when(userRepository).deleteUserById("user123");
        ResponseEntity<String> response = userService.deleteUserById("user123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("eliminado"));
    }

    @Test
    void updateUser_shouldReturnUpdatedUser_whenExists() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.updateUser(user)).thenReturn(user);

        ResponseEntity<?> response = userService.updateUser(user);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(user, response.getBody());
    }

    @Test
    void getUserRoles_shouldReturnRoles_whenPresent() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.getUserRoles("user123")).thenReturn(List.of("ADMIN"));

        ResponseEntity<List<String>> response = userService.getUserRoles("user123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of("ADMIN"), response.getBody());
    }

    @Test
    void addRoleToUser_shouldReturnRoles_whenSuccessful() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.addRoleToUser("user123", "MOD")).thenReturn(List.of("MOD"));

        ResponseEntity<List<String>> response = userService.addRoleToUser("user123", "MOD");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of("MOD"), response.getBody());
    }

    @Test
    void deleteRoleToUser_shouldReturnOk_whenSuccessful() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        doNothing().when(userRepository).deleteRoleToUser("user123", "MOD");

        ResponseEntity<String> response = userService.deleteRoleToUser("user123", "MOD");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("eliminado"));
    }

    @Test
    void searchUsersByText_shouldReturnMatchingUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        ResponseEntity<List<User>> response = userService.searchUsersByText("jdoe");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void exist_shouldReturnTrue_whenExists() {
        when(userRepository.exist("user123")).thenReturn(true);
        assertTrue(userService.exist("user123"));
    }

    @Test
    void exist_shouldReturnFalse_whenNotExists() {
        when(userRepository.exist("unknown")).thenReturn(false);
        assertFalse(userService.exist("unknown"));
    }

    // casos de error

    @Test
    void findById_shouldReturnNotFound_whenUserNotExists() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());
        ResponseEntity<Optional<User>> response = userService.findById("unknown");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void findById_shouldReturnInternalError_whenExceptionThrown() {
        when(userRepository.findById("x")).thenThrow(new RuntimeException());
        ResponseEntity<Optional<User>> response = userService.findById("x");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void findAll_shouldReturnNotFound_whenEmptyList() {
        when(userRepository.findAll()).thenReturn(List.of());
        ResponseEntity<List<User>> response = userService.findAll();

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void findAll_shouldReturnInternalError_whenExceptionThrown() {
        when(userRepository.findAll()).thenThrow(new RuntimeException());
        ResponseEntity<List<User>> response = userService.findAll();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void deleteUserById_shouldReturnNotFound_whenNotFoundExceptionThrown() {
        doThrow(new NotFoundException("Not found")).when(userRepository).deleteUserById("id");
        ResponseEntity<String> response = userService.deleteUserById("id");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteUserById_shouldReturnInternalError_whenExceptionThrown() {
        doThrow(new RuntimeException()).when(userRepository).deleteUserById("id");
        ResponseEntity<String> response = userService.deleteUserById("id");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void updateUser_shouldReturnNotFound_whenUserMissing() {
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        ResponseEntity<?> response = userService.updateUser(user);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Usuario no encontrado"));
    }

    @Test
    void updateUser_shouldHandleConflict_whenClientError409() {
        ClientErrorException ex = mock(ClientErrorException.class);
        Response mockResponse = mock(Response.class);
        when(ex.getResponse()).thenReturn(mockResponse);
        when(mockResponse.getStatus()).thenReturn(409);
        when(mockResponse.readEntity(String.class)).thenReturn("Duplicado");

        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        doThrow(ex).when(userRepository).updateUser(user);

        ResponseEntity<?> response = userService.updateUser(user);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Conflicto"));
    }

    @Test
    void updateUser_shouldHandleGenericClientError() {
        ClientErrorException ex = mock(ClientErrorException.class);
        Response mockResponse = mock(Response.class);
        when(ex.getResponse()).thenReturn(mockResponse);
        when(mockResponse.getStatus()).thenReturn(403);
        when(mockResponse.readEntity(String.class)).thenThrow(new RuntimeException());

        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        doThrow(ex).when(userRepository).updateUser(user);

        ResponseEntity<?> response = userService.updateUser(user);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Keycloak"));
    }

    @Test
    void updateUser_shouldReturnInternalError_onException() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.updateUser(user)).thenThrow(new RuntimeException("error"));

        ResponseEntity<?> response = userService.updateUser(user);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getUserRoles_shouldReturnNotFound_whenUserOrRolesMissing() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.getUserRoles("user123")).thenReturn(List.of());

        ResponseEntity<List<String>> response = userService.getUserRoles("user123");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getUserRoles_shouldReturnInternalError_onException() {
        when(userRepository.findById("user123")).thenThrow(new RuntimeException());

        ResponseEntity<List<String>> response = userService.getUserRoles("user123");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void addRoleToUser_shouldReturnNotFound_whenRolesEmpty() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.addRoleToUser("user123", "MOD")).thenReturn(List.of());

        ResponseEntity<List<String>> response = userService.addRoleToUser("user123", "MOD");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void addRoleToUser_shouldReturnInternalError_onException() {
        when(userRepository.findById("user123")).thenThrow(new RuntimeException());

        ResponseEntity<List<String>> response = userService.addRoleToUser("user123", "MOD");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void deleteRoleToUser_shouldReturnInternalError_onException() {
        when(userRepository.findById("user123")).thenThrow(new RuntimeException());

        ResponseEntity<String> response = userService.deleteRoleToUser("user123", "MOD");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void searchUsersByText_shouldReturnNotFound_whenNoMatch() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        ResponseEntity<List<User>> response = userService.searchUsersByText("nope");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void searchUsersByText_shouldReturnInternalError_onException() {
        when(userRepository.findAll()).thenThrow(new RuntimeException());

        ResponseEntity<List<User>> response = userService.searchUsersByText("jdoe");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void findById_shouldReturnInternalServerErrorWhenUnexpectedExceptionThrown() {
        when(userRepository.findById("user123")).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<Optional<User>> response = userService.findById("user123");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getUserRoles_shouldReturnNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        ResponseEntity<List<String>> response = userService.getUserRoles("user123");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getUserRoles_shouldReturnNotFoundWhenUserHasNoRoles() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(userRepository.getUserRoles("user123")).thenReturn(List.of());

        ResponseEntity<List<String>> response = userService.getUserRoles("user123");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void addRoleToUser_shouldReturnNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        ResponseEntity<List<String>> response = userService.addRoleToUser("user123", "ADMIN");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void addRoleToUser_shouldReturnNotFoundWhenNoRolesAdded() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(userRepository.addRoleToUser("user123", "ADMIN")).thenReturn(List.of());

        ResponseEntity<List<String>> response = userService.addRoleToUser("user123", "ADMIN");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteRoleToUser_shouldReturnNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        ResponseEntity<String> response = userService.deleteRoleToUser("user123", "ADMIN");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void findById_shouldReturnNotFound_whenNotFoundExceptionIsThrown() {
        String userId = "user123";

        when(userRepository.findById(userId)).thenThrow(new NotFoundException("Usuario no encontrado"));

        ResponseEntity<Optional<User>> response = userService.findById(userId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}