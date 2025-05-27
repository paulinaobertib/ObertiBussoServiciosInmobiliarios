package pi.ms_users.repository;

import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.*;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import pi.ms_users.domain.User;
import pi.ms_users.repository.UserRepository.KeycloakUserRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    @InjectMocks
    private KeycloakUserRepository repository;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(repository, "realm", "test-realm");
        when(keycloak.realm("test-realm")).thenReturn(realmResource);
        when(realmResource.users()).thenReturn(usersResource);
    }

    // casos de exito

    @Test
    void testFindById_success() {
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
        assertEquals("prueba", result.get().getUsername());
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
        repository.deleteUserById(id);
        verify(usersResource).delete(id);
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

        assertEquals("email", updated.getMail());
    }

    @Test
    void getUserRoles_success() {
        RoleRepresentation role = new RoleRepresentation();
        role.setName("admin");

        when(usersResource.get("123")).thenReturn(userResource);
        when(userResource.roles()).thenReturn(roleMappingResource);
        when(roleMappingResource.realmLevel()).thenReturn(roleScopeResource);
        when(roleScopeResource.listAll()).thenReturn(List.of(role));

        List<String> roles = repository.getUserRoles("123");

        assertEquals(List.of("admin"), roles);
    }

    @Test
    void addRoleToUser_success() {
        String id = "123";
        RoleRepresentation role = new RoleRepresentation();
        role.setName("admin");

        when(usersResource.get(id)).thenReturn(userResource);
        when(realmResource.roles()).thenReturn(rolesResource);
        when(rolesResource.get("admin")).thenReturn(roleResource);
        when(roleResource.toRepresentation()).thenReturn(role);
        when(userResource.roles()).thenReturn(roleMappingResource);
        when(roleMappingResource.realmLevel()).thenReturn(roleScopeResource);
        when(roleScopeResource.listAll()).thenReturn(List.of(role));

        List<String> result = repository.addRoleToUser(id, "admin");
        assertEquals(List.of("admin"), result);
    }

    @Test
    void deleteRoleToUser_success() {
        RoleRepresentation role = new RoleRepresentation();
        role.setName("user");

        when(usersResource.get("123")).thenReturn(userResource);
        when(realmResource.roles()).thenReturn(rolesResource);
        when(rolesResource.get("user")).thenReturn(roleResource);
        when(roleResource.toRepresentation()).thenReturn(role);
        when(userResource.roles()).thenReturn(roleMappingResource);
        when(roleMappingResource.realmLevel()).thenReturn(roleScopeResource);

        repository.deleteRoleToUser("123", "user");

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

    // casos de error

    @Test
    void findById_error() {
        String id = "notfound";
        when(usersResource.get(id)).thenThrow(new NotFoundException("User not found"));

        assertThrows(NotFoundException.class, () -> repository.findById(id));
    }

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
        when(usersResource.get("fail")).thenThrow(new RuntimeException("Error"));
        assertThrows(RuntimeException.class, () -> repository.getUserRoles("fail"));
    }

    @Test
    void addRoleToUser_error() {
        when(rolesResource.get("invalid")).thenThrow(new RuntimeException("Role not found"));
        when(usersResource.get("id")).thenReturn(userResource);
        when(realmResource.roles()).thenReturn(rolesResource);

        assertThrows(RuntimeException.class, () -> repository.addRoleToUser("id", "invalid"));
    }

    @Test
    void deleteRoleToUser_error() {
        when(rolesResource.get("fail")).thenThrow(new RuntimeException("Role error"));
        when(realmResource.roles()).thenReturn(rolesResource);
        when(usersResource.get("123")).thenReturn(userResource);

        assertThrows(RuntimeException.class, () -> repository.deleteRoleToUser("123", "fail"));
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
}

