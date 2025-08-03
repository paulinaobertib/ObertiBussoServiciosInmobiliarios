package pi.ms_users.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import pi.ms_users.domain.AgentChat;
import pi.ms_users.domain.User;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.impl.UserService;
import pi.ms_users.service.interf.IAgentChatService;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SuppressWarnings("unused")
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private IUserRepository userRepository;

    @Mock
    private IAgentChatService agentChatService;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId("user123");
        user.setUserName("jdoe");
        user.setEmail("jdoe@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPhone("1234567890");
    }

    // casos de exito

    @Test
    void findById_shouldReturnUser_whenFound() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        ResponseEntity<User> response = userService.findById("user123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
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
    void addRoleToUser_shouldCreateAgentChat_whenRoleIsAdmin() {
        User user = new User();
        user.setId("user123");
        user.setFirstName("Juan");
        user.setLastName("Pérez");

        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.addRoleToUser("user123", "admin")).thenReturn(List.of("admin"));
        doNothing().when(agentChatService).create(any(AgentChat.class));

        ResponseEntity<List<String>> response = userService.addRoleToUser("user123", "admin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of("admin"), response.getBody());

        ArgumentCaptor<AgentChat> captor = ArgumentCaptor.forClass(AgentChat.class);
        verify(agentChatService).create(captor.capture());

        AgentChat captured = captor.getValue();
        assertEquals("user123", captured.getUserId());
        assertEquals("Juan Pérez", captured.getName());
        assertFalse(captured.getEnabled());
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
    void deleteRoleToUser_shouldDeleteAgentChat_whenRoleIsAdmin() {
        User user = new User();
        user.setId("user123");

        AgentChat agentChat = new AgentChat();
        agentChat.setId(10L);
        agentChat.setUserId("user123");

        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        doNothing().when(userRepository).deleteRoleToUser("user123", "admin");
        when(agentChatService.getByUserId("user123")).thenReturn(agentChat);
        doNothing().when(agentChatService).delete(10L);

        ResponseEntity<String> response = userService.deleteRoleToUser("user123", "admin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("eliminado"));

        verify(agentChatService).getByUserId("user123");
        verify(agentChatService).delete(10L);
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

    @Test
    void getUserInfo_shouldReturnCorrectMap() {
        Jwt jwt = mock(Jwt.class);

        when(jwt.getClaimAsString("sub")).thenReturn("user123");
        when(jwt.getClaimAsString("preferred_username")).thenReturn("jdoe");
        when(jwt.getClaimAsString("given_name")).thenReturn("John");
        when(jwt.getClaimAsString("family_name")).thenReturn("Doe");
        when(jwt.getClaimAsString("email")).thenReturn("jdoe@example.com");
        when(jwt.getClaimAsString("phone_number")).thenReturn("1234567890");

        Map<String, String> userInfo = userService.getUserInfo(jwt);

        assertEquals("user123", userInfo.get("id"));
        assertEquals("jdoe", userInfo.get("userName"));
        assertEquals("John", userInfo.get("firstName"));
        assertEquals("Doe", userInfo.get("lastName"));
        assertEquals("jdoe@example.com", userInfo.get("email"));
        assertEquals("1234567890", userInfo.get("phone"));
    }

    @Test
    void findTenat_shouldReturnUsers_whenFound() {
        List<User> tenants = List.of(user);
        when(userRepository.findByRoleTenant()).thenReturn(tenants);

        ResponseEntity<List<User>> response = userService.findTenat();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(tenants, response.getBody());
    }

    @Test
    void createUser_shouldReturnOk_whenStatus201() {
        Response response = mock(Response.class);
        when(response.getStatus()).thenReturn(201);
        when(userRepository.createUser(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(response);

        ResponseEntity<String> resp = userService.createUser("John", "Doe", "jdoe@example.com", "1234567890");

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("Se ha creado el usuario con éxito", resp.getBody());
    }

    // casos de error

    @Test
    void findById_shouldThrowNotFoundException_whenUserNotExists() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.findById("unknown"));

        assertEquals("No se encontró el usuario con ID: unknown", ex.getMessage());
    }

    @Test
    void findById_shouldThrowRuntimeException_whenExceptionThrown() {
        when(userRepository.findById("x")).thenThrow(new RuntimeException());

        assertThrows(RuntimeException.class, () -> userService.findById("x"));
    }

    @Test
    void findAll_shouldThrowRuntimeException_whenExceptionThrown() {
        when(userRepository.findAll()).thenThrow(new RuntimeException());

        assertThrows(RuntimeException.class, () -> userService.findAll());
    }

    @Test
    void deleteUserById_shouldThrowNotFoundException_whenNotFoundExceptionThrown() {
        doThrow(new NotFoundException("Not found")).when(userRepository).deleteUserById("id");

        NotFoundException ex = assertThrows(NotFoundException.class, () ->
            userService.deleteUserById("id"));

        assertEquals("Not found", ex.getMessage());
    }

    @Test
    void deleteUserById_shouldThrowRuntimeException_whenExceptionThrown() {
        doThrow(new RuntimeException()).when(userRepository).deleteUserById("id");

        assertThrows(RuntimeException.class, () -> userService.deleteUserById("id"));
    }

    @Test
    void findTenat_shouldThrow_whenNoUsersFound() {
        when(userRepository.findByRoleTenant()).thenReturn(Collections.emptyList());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class,
                () -> userService.findTenat());

        assertEquals("No se han encontrado inquilinos.", ex.getMessage());
    }

    @Test
    void createUser_shouldReturnConflict_whenStatus409() {
        Response response = mock(Response.class);
        when(response.getStatus()).thenReturn(409);
        when(userRepository.createUser(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(response);

        ResponseEntity<String> resp = userService.createUser("John", "Doe", "jdoe@example.com", "1234567890");

        assertEquals(HttpStatus.CONFLICT, resp.getStatusCode());
        assertEquals("El usuario ya existe", resp.getBody());
    }

    @Test
    void createUser_shouldReturnBadRequest_whenStatus400() {
        Response response = mock(Response.class);
        when(response.getStatus()).thenReturn(400);
        when(userRepository.createUser(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(response);

        ResponseEntity<String> resp = userService.createUser("John", "Doe", "jdoe@example.com", "1234567890");

        assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
        assertEquals("Datos inválidos enviados a Keycloak", resp.getBody());
    }

    @Test
    void createUser_shouldReturnInternalServerError_whenOtherStatus() {
        Response response = mock(Response.class);
        when(response.getStatus()).thenReturn(500);
        when(response.readEntity(String.class)).thenReturn("Internal Server Error");
        when(userRepository.createUser(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(response);

        ResponseEntity<String> resp = userService.createUser("John", "Doe", "jdoe@example.com", "1234567890");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
        assertTrue(resp.getBody().contains("Error inesperado en Keycloak: Internal Server Error"));
    }

    @Test
    void findAll_shouldThrowNotFoundException_whenEmptyList() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.findAll());

        assertEquals("No se encontraron usuarios.", ex.getMessage());
    }

    @Test
    void updateUser_shouldThrowNotFoundException_whenUserMissing() {
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.updateUser(user));

        assertTrue(ex.getMessage().contains("Usuario no encontrado"));
    }

    @Test
    void updateUser_shouldThrowClientErrorException_whenConflict409() {
        ClientErrorException ex = mock(ClientErrorException.class);
        Response mockResponse = mock(Response.class);
        when(ex.getResponse()).thenReturn(mockResponse);
        when(mockResponse.getStatus()).thenReturn(409);
        when(mockResponse.readEntity(String.class)).thenReturn("Duplicado");

        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        doThrow(ex).when(userRepository).updateUser(user);

        ClientErrorException thrown = assertThrows(ClientErrorException.class, () ->
            userService.updateUser(user));

        assertEquals(409, thrown.getResponse().getStatus());
        assertTrue(thrown.getResponse().readEntity(String.class).contains("Duplicado"));
    }

    @Test
    void updateUser_shouldThrowRuntimeException_onException() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.updateUser(user)).thenThrow(new RuntimeException("error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            userService.updateUser(user));

        assertEquals("error", ex.getMessage());
    }

    @Test
    void getUserRoles_shouldThrowNotFoundException_whenRolesMissing() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.getUserRoles("user123")).thenReturn(List.of());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.getUserRoles("user123"));

        assertEquals("El usuario no tiene roles asignados", ex.getMessage());
    }

    @Test
    void getUserRoles_shouldThrowRuntimeException_onException() {
        when(userRepository.findById("user123")).thenThrow(new RuntimeException());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            userService.getUserRoles("user123"));
    }

    @Test
    void addRoleToUser_shouldThrowNotFoundException_whenRolesEmpty() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(userRepository.addRoleToUser("user123", "MOD")).thenReturn(Collections.emptyList());

        assertThrows(EntityNotFoundException.class, () ->
            userService.addRoleToUser("user123", "MOD"));
    }

    @Test
    void addRoleToUser_shouldThrowRuntimeException_onException() {
        when(userRepository.findById("user123")).thenThrow(new RuntimeException());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            userService.addRoleToUser("user123", "MOD"));
    }

    @Test
    void deleteRoleToUser_shouldThrowRuntimeException_onException() {
        when(userRepository.findById("user123")).thenThrow(new RuntimeException());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            userService.deleteRoleToUser("user123", "MOD"));
    }

    @Test
    void searchUsersByText_shouldThrowNotFoundException_whenNoMatch() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.searchUsersByText("nope"));

        assertEquals("No se encontraron usuarios que coincidan con la búsqueda.", ex.getMessage());
    }

    @Test
    void searchUsersByText_shouldThrowRuntimeException_onException() {
        when(userRepository.findAll()).thenThrow(new RuntimeException());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            userService.searchUsersByText("jdoe"));
    }

    @Test
    void findById_shouldThrowRuntimeExceptionWhenUnexpectedExceptionThrown() {
        when(userRepository.findById("user123")).thenThrow(new RuntimeException("DB error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            userService.findById("user123"));

        assertEquals("DB error", ex.getMessage());
    }

    @Test
    void getUserRoles_shouldThrowNotFoundExceptionWhenUserDoesNotExist() {
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.getUserRoles("user123"));

        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void getUserRoles_shouldThrowNotFoundExceptionWhenUserHasNoRoles() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(userRepository.getUserRoles("user123")).thenReturn(List.of());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.getUserRoles("user123"));

        assertEquals("El usuario no tiene roles asignados", ex.getMessage());
    }

    @Test
    void addRoleToUser_shouldThrowNotFoundExceptionWhenUserDoesNotExist() {
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.addRoleToUser("user123", "ADMIN"));

        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void addRoleToUser_shouldThrowNotFoundExceptionWhenNoRolesAdded() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(new User()));
        when(userRepository.addRoleToUser("user123", "ADMIN")).thenReturn(List.of());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.addRoleToUser("user123", "ADMIN"));

        assertEquals("No se agregaron roles al usuario", ex.getMessage());
    }

    @Test
    void deleteRoleToUser_shouldThrowNotFoundExceptionWhenUserDoesNotExist() {
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            userService.deleteRoleToUser("user123", "ADMIN"));

        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void findById_shouldThrowNotFoundException_whenNotFoundExceptionIsThrown() {
        String userId = "user123";

        when(userRepository.findById(userId)).thenThrow(new NotFoundException("Usuario no encontrado"));

        NotFoundException ex = assertThrows(NotFoundException.class, () ->
            userService.findById(userId));

        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void getUserRoles_shouldThrowAccessDeniedException_whenUserIsNotAdminAndNotOwner() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isAdmin).thenReturn(false);
            utilities.when(SecurityUtils::isUser).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> userService.getUserRoles("user123"));
        }
    }

    @Test
    void deleteUserById_shouldThrowAccessDeniedException_whenUserIsNotAdminAndNotOwner() {
        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isAdmin).thenReturn(false);
            utilities.when(SecurityUtils::isUser).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> userService.deleteUserById("user123"));
        }
    }

    @Test
    void updateUser_shouldThrowAccessDeniedException_whenUserIsNotAdminAndNotOwner() {
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isAdmin).thenReturn(false);
            utilities.when(SecurityUtils::isUser).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> userService.updateUser(user));
        }
    }

    @Test
    void exist_shouldThrowAccessDeniedException_whenUserIsNotAdminAndNotOwner() {
        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isAdmin).thenReturn(false);
            utilities.when(SecurityUtils::isUser).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> userService.exist("user123"));
        }
    }
}