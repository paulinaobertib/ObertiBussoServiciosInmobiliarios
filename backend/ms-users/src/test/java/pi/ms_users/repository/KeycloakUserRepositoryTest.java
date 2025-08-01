package pi.ms_users.repository;

import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.*;
import org.keycloak.representations.idm.ClientRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import pi.ms_users.domain.User;
import pi.ms_users.domain.UserNotificationPreference;
import pi.ms_users.repository.UserRepository.KeycloakUserRepository;
import pi.ms_users.service.impl.EmailService;

import java.net.URI;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KeycloakUserRepositoryTest {

    @Mock
    private Keycloak keycloak;

    @Mock
    private RealmResource realmResource;

    @Mock
    private UsersResource usersResource;

    @Mock
    private UserResource userResource;

    @Mock
    private RoleMappingResource roleMappingResource;

    @Mock
    private RoleScopeResource roleScopeResource;

    @Mock
    private RolesResource rolesResource;

    @Mock
    private RoleResource roleResource;

    @Mock
    private ClientsResource clientsResource;

    @Mock
    private ClientResource clientResource;

    @Mock
    private EmailService emailService;

    @Mock
    private RolesResource clientRolesResource;

    @Mock
    private IUserNotificationPreferenceRepository userNotificationPreferenceRepository;

    @InjectMocks
    private KeycloakUserRepository repository;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(repository, "realm", "test-realm");
        ReflectionTestUtils.setField(repository, "clientId", "example-client-id");

        lenient().when(keycloak.realm("test-realm")).thenReturn(realmResource);
        lenient().when(realmResource.users()).thenReturn(usersResource);
    }

    // casos de exito

    @Test
    void createUser_shouldReturnCreated_whenSuccessful() {
        String name = "John";
        String lastName = "Doe";
        String email = "john.doe@example.com";
        String phone = "123456789";
        String userId = "generated-user-id";
        String clientUuid = "client-uuid";

        Response response = mock(Response.class);
        UserResource userResource = mock(UserResource.class);
        RoleRepresentation userRole = mock(RoleRepresentation.class);
        RoleRepresentation tenantRole = mock(RoleRepresentation.class);
        ClientRepresentation clientRepresentation = mock(ClientRepresentation.class);
        ClientResource clientResource = mock(ClientResource.class);
        RoleResource roleResource = mock(RoleResource.class);

        when(usersResource.create(any())).thenReturn(response);
        when(response.getStatus()).thenReturn(201);
        when(response.getLocation()).thenReturn(URI.create("http://localhost/users/" + userId));
        when(usersResource.get(userId)).thenReturn(userResource);

        doNothing().when(userResource).resetPassword(any());

        when(realmResource.clients()).thenReturn(clientsResource);
        when(clientsResource.findByClientId("example-client-id")).thenReturn(List.of(clientRepresentation));
        when(clientRepresentation.getId()).thenReturn(clientUuid);
        when(clientsResource.get(clientUuid)).thenReturn(clientResource);

        when(clientResource.roles()).thenReturn(rolesResource);
        when(rolesResource.get("user")).thenReturn(roleResource);
        when(rolesResource.get("tenant")).thenReturn(roleResource);
        when(roleResource.toRepresentation()).thenReturn(userRole, tenantRole);

        when(userResource.roles()).thenReturn(roleMappingResource);
        when(roleMappingResource.clientLevel(clientUuid)).thenReturn(roleScopeResource);
        doNothing().when(roleScopeResource).add(List.of(userRole, tenantRole));

        doNothing().when(emailService).sendNewUserCredentialsEmail(any());

        Response result = repository.createUser(name, lastName, email, phone);

        assertEquals(Response.Status.CREATED.getStatusCode(), result.getStatus());
    }

    @Test
    void findById_success() {
        String userId = "user123";
        UserRepresentation userRep = new UserRepresentation();
        userRep.setId(userId);
        userRep.setUsername("prueba");
        userRep.setEmail("prueba@test.com");
        userRep.setFirstName("Prueba");
        userRep.setLastName("Prueba");

        Map<String, List<String>> attrs = new HashMap<>();
        attrs.put("phone", List.of("123456789"));
        userRep.setAttributes(attrs);

        when(keycloak.realm("test-realm")).thenReturn(realmResource);
        when(realmResource.users()).thenReturn(usersResource);
        when(usersResource.get(userId)).thenReturn(userResource);
        when(userResource.toRepresentation()).thenReturn(userRep);

        Optional<User> result = repository.findById(userId);

        assertTrue(result.isPresent());
        assertEquals("prueba", result.get().getUserName());
        assertEquals("Prueba", result.get().getFirstName());
        assertEquals("123456789", result.get().getPhone());
    }

    @Test
    void findAll_success() {
        UserRepresentation ur = new UserRepresentation();
        ur.setId("1");
        ur.setUsername("user");

        when(usersResource.list()).thenReturn(List.of(ur));

        List<User> users = repository.findAll();
        assertEquals(1, users.size());
    }

    @Test
    void deleteUserById_success() {
        String id = "123";

        List<UserNotificationPreference> mockPrefs = List.of(
                new UserNotificationPreference(), new UserNotificationPreference()
        );
        when(userNotificationPreferenceRepository.findByUserId(id)).thenReturn(mockPrefs);

        repository.deleteUserById(id);

        verify(usersResource).delete(id);
        verify(userNotificationPreferenceRepository).findByUserId(id);
        verify(userNotificationPreferenceRepository).deleteAll(mockPrefs);
    }

    @Test
    void updateUser_success() {
        String id = "123";
        User input = new User(id, "user", "email", "First", "Last", "123");

        UserRepresentation ur = new UserRepresentation();
        ur.setId(id);
        ur.setAttributes(new HashMap<>());

        when(usersResource.get(id)).thenReturn(userResource);
        when(userResource.toRepresentation()).thenReturn(ur);

        doNothing().when(userResource).update(any());

        User updated = repository.updateUser(input);

        assertEquals("email", updated.getEmail());
    }

    @Test
    void getUserRoles_success() {
        RoleRepresentation role = new RoleRepresentation();
        role.setName("admin");

        ClientRepresentation clientRepresentation = new ClientRepresentation();
        clientRepresentation.setId("client-uuid-123");  // ID ficticio
        clientRepresentation.setClientId("example-client-id");

        when(realmResource.clients()).thenReturn(clientsResource);
        when(clientsResource.findByClientId("example-client-id")).thenReturn(List.of(clientRepresentation));
        when(usersResource.get("123")).thenReturn(userResource);
        when(userResource.roles()).thenReturn(roleMappingResource);
        when(roleMappingResource.clientLevel("client-uuid-123")).thenReturn(roleScopeResource);
        when(roleScopeResource.listAll()).thenReturn(List.of(role));

        List<String> roles = repository.getUserRoles("123");

        assertEquals(List.of("admin"), roles);
    }

    @Test
    void addRoleToUser_success() {
        String id = "123";
        String roleName = "admin";

        RoleRepresentation role = new RoleRepresentation();
        role.setName(roleName);

        ClientRepresentation client = new ClientRepresentation();
        client.setId("client-uuid");
        List<ClientRepresentation> clientList = List.of(client);

        when(usersResource.get(id)).thenReturn(userResource);
        when(realmResource.clients()).thenReturn(clientsResource);
        when(clientsResource.findByClientId("example-client-id")).thenReturn(clientList);
        when(clientsResource.get("client-uuid")).thenReturn(clientResource);
        when(clientResource.roles()).thenReturn(clientRolesResource);
        when(clientRolesResource.get(roleName)).thenReturn(roleResource);
        when(roleResource.toRepresentation()).thenReturn(role);
        when(userResource.roles()).thenReturn(roleMappingResource);
        when(roleMappingResource.clientLevel("client-uuid")).thenReturn(roleScopeResource);
        when(roleScopeResource.listAll()).thenReturn(List.of(role));

        List<String> result = repository.addRoleToUser(id, roleName);
        assertEquals(List.of(roleName), result);
    }

    @Test
    void deleteRoleToUser_success() {
        String id = "123";
        String roleName = "user";

        RoleRepresentation role = new RoleRepresentation();
        role.setName(roleName);

        ClientRepresentation client = new ClientRepresentation();
        client.setId("client-uuid");

        when(usersResource.get(id)).thenReturn(userResource);
        when(realmResource.clients()).thenReturn(clientsResource);
        when(clientsResource.findByClientId("example-client-id")).thenReturn(List.of(client));
        when(clientsResource.get("client-uuid")).thenReturn(clientResource);
        when(clientResource.roles()).thenReturn(clientRolesResource);
        when(clientRolesResource.get(roleName)).thenReturn(roleResource);
        when(roleResource.toRepresentation()).thenReturn(role);
        when(userResource.roles()).thenReturn(roleMappingResource);
        when(roleMappingResource.clientLevel("client-uuid")).thenReturn(roleScopeResource);

        repository.deleteRoleToUser(id, roleName);

        verify(roleScopeResource).remove(List.of(role));
    }

    @Test
    void exist_success() {
        UserRepresentation ur = new UserRepresentation();
        ur.setId("123");
        when(usersResource.get("123")).thenReturn(userResource);
        when(userResource.toRepresentation()).thenReturn(ur);

        assertTrue(repository.exist("123"));
    }

    @Test
    void testFindById_returnsEmptyWhenRepresentationIsNull() {
        String userId = "user123";

        when(keycloak.realm("test-realm")).thenReturn(realmResource);
        when(realmResource.users()).thenReturn(usersResource);
        when(usersResource.get(userId)).thenReturn(userResource);
        when(userResource.toRepresentation()).thenReturn(null);

        Optional<User> result = repository.findById(userId);

        assertTrue(result.isEmpty());
    }

    @Test
    void testFindById_returnsEmptyWhenExceptionThrown() {
        String userId = "user123";

        when(keycloak.realm("test-realm")).thenReturn(realmResource);
        when(realmResource.users()).thenReturn(usersResource);
        when(usersResource.get(userId)).thenThrow(new RuntimeException("Keycloak no responde"));

        Optional<User> result = repository.findById(userId);

        assertTrue(result.isEmpty());
    }

    @Test
    void findByRoleTenant_success() {
        ClientRepresentation client = new ClientRepresentation();
        client.setId("client-uuid");

        UserRepresentation ur = new UserRepresentation();
        ur.setId("123");
        ur.setUsername("tenantuser");

        when(realmResource.clients()).thenReturn(mock(ClientsResource.class));
        ClientsResource clientsResource = realmResource.clients();
        when(clientsResource.findByClientId("example-client-id")).thenReturn(List.of(client));
        when(clientsResource.get("client-uuid")).thenReturn(mock(ClientResource.class));
        ClientResource clientResource = clientsResource.get("client-uuid");

        RolesResource roles = mock(RolesResource.class);
        when(clientResource.roles()).thenReturn(roles);

        RoleResource tenantRole = mock(RoleResource.class);
        when(roles.get("tenant")).thenReturn(tenantRole);
        when(tenantRole.getUserMembers()).thenReturn(List.of(ur));

        List<User> result = repository.findByRoleTenant();

        assertEquals(1, result.size());
        assertEquals("tenantuser", result.getFirst().getUserName());
    }

    // casos de error

    @Test
    void findAll_error() {
        when(usersResource.list()).thenThrow(new RuntimeException("Internal error"));
        assertThrows(RuntimeException.class, () -> repository.findAll());
    }

    @Test
    void deleteUserById_error() {
        String id = "error";
        doThrow(new RuntimeException("Deletion failed")).when(usersResource).delete(id);
        assertThrows(RuntimeException.class, () -> repository.deleteUserById(id));
    }

    @Test
    void updateUser_error() {
        User input = new User("fail", "user", "email", "F", "L", "123");
        when(usersResource.get("fail")).thenThrow(new RuntimeException("Update failed"));

        assertThrows(RuntimeException.class, () -> repository.updateUser(input));
    }

    @Test
    void getUserRoles_error() {
        assertThrows(RuntimeException.class, () -> repository.getUserRoles("fail"));
    }

    @Test
    void addRoleToUser_error() {
        String id = "id";
        String roleName = "invalid";

        when(usersResource.get(id)).thenReturn(userResource);
        when(realmResource.clients()).thenReturn(clientsResource);
        when(clientsResource.findByClientId("example-client-id")).thenReturn(List.of());

        assertThrows(RuntimeException.class, () -> repository.addRoleToUser(id, roleName));
    }

    @Test
    void deleteRoleToUser_error() {
        String id = "123";
        String roleName = "fail";

        when(usersResource.get(id)).thenReturn(userResource);
        when(realmResource.clients()).thenReturn(clientsResource);
        when(clientsResource.findByClientId("example-client-id")).thenReturn(List.of());

        assertThrows(RuntimeException.class, () -> repository.deleteRoleToUser(id, roleName));
    }

    @Test
    void exist_notFound() {
        when(usersResource.get("999")).thenThrow(new NotFoundException("not found"));
        assertFalse(repository.exist("999"));
    }

    @Test
    void exist_error() {
        when(usersResource.get("error")).thenThrow(new RuntimeException("Unexpected"));
        assertThrows(RuntimeException.class, () -> repository.exist("error"));
    }

    @Test
    void createUser_failureOnCreate() {
        when(usersResource.create(any())).thenThrow(new RuntimeException("Keycloak error"));

        Response response = repository.createUser("Jane", "Smith", "jane@example.com", "987654");
        assertEquals(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), response.getStatus());
        assertTrue(response.getEntity().toString().contains("Error al crear usuario"));
    }

    @Test
    void findByRoleTenant_noClientsFound() {
        when(realmResource.clients()).thenReturn(clientsResource);
        when(clientsResource.findByClientId("example-client-id")).thenReturn(List.of());

        assertThrows(NoSuchElementException.class, () -> repository.findByRoleTenant());
    }
}

