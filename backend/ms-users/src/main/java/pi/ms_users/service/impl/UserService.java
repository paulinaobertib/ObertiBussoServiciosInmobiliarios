package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.User;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.security.SecurityUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final IUserRepository userRepository;

    public ResponseEntity<String> createUser(String name, String lastName, String email, String phone) {
        Response response = userRepository.createUser(name, lastName, email, phone);
        int status = response.getStatus();

        return switch (status) {
            case 201 -> ResponseEntity.ok("Se ha creado el usuario con éxito");
            case 409 -> ResponseEntity.status(HttpStatus.CONFLICT).body("El usuario ya existe");
            case 400 -> ResponseEntity.badRequest().body("Datos inválidos enviados a Keycloak");
            default -> {
                String error = response.readEntity(String.class);
                yield ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error inesperado en Keycloak: " + error);
            }
        };
    }

    public Map<String, String> getUserInfo(Jwt jwt) {
        String id = jwt.getClaimAsString("sub");
        String userName = jwt.getClaimAsString("preferred_username");
        String name = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");
        String email = jwt.getClaimAsString("email");
        String phone = jwt.getClaimAsString("phone_number");
        Map<String, String> userInfo = new LinkedHashMap<>();
        userInfo.put("id", id);
        userInfo.put("userName", userName);
        userInfo.put("name", name);
        userInfo.put("lastName", lastName);
        userInfo.put("email", email);
        userInfo.put("phone", phone);
        return userInfo;
    }

    public ResponseEntity<User> findById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario con ID: " + id));
        return ResponseEntity.ok(user);
    }

    public ResponseEntity<List<User>> findTenat() {
        List<User> users = userRepository.findByRoleTenant();
        if (users.isEmpty()) {
            throw new EntityNotFoundException("No se han encontrado inquilinos.");
        }
        return ResponseEntity.ok(users);
    }

    public ResponseEntity<List<User>> findAll() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            throw new EntityNotFoundException("No se encontraron usuarios.");
        }
        return ResponseEntity.ok(users);
    }

    public ResponseEntity<String> deleteUserById(String id) {

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !id.equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        userRepository.deleteUserById(id);
        return ResponseEntity.ok("Se ha eliminado el usuario");
    }

    public ResponseEntity<User> updateUser(User user) {
        userRepository.findById(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !user.getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        User updated = userRepository.updateUser(user);
        return ResponseEntity.ok(updated);
    }

    public ResponseEntity<List<String>> getUserRoles(String id) {
        userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !id.equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        List<String> roles = userRepository.getUserRoles(id);
        if (roles.isEmpty()) {
            throw new EntityNotFoundException("El usuario no tiene roles asignados");
        }

        return ResponseEntity.ok(roles);
    }

    public ResponseEntity<List<String>> addRoleToUser(String id, String role) {
        userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        List<String> roles = userRepository.addRoleToUser(id, role);
        if (roles == null || roles.isEmpty()) {
            throw new EntityNotFoundException("No se agregaron roles al usuario");
        }

        return ResponseEntity.ok(roles);
    }

    public ResponseEntity<String> deleteRoleToUser(String id, String role) {
        userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        userRepository.deleteRoleToUser(id, role);
        return ResponseEntity.ok("Se le ha eliminado el rol seleccionado al usuario");
    }

    private boolean contains(String field, String searchTerm) {
        return field != null && searchTerm != null &&
                field.toLowerCase().contains(searchTerm.toLowerCase());
    }

    public ResponseEntity<List<User>> searchUsersByText(String searchTerm) {
        List<User> allUsers = userRepository.findAll();

        List<User> filteredUsers = allUsers.stream()
                .filter(user -> contains(user.getUsername(), searchTerm) ||
                        contains(user.getMail(), searchTerm) ||
                        contains(user.getFirstName(), searchTerm) ||
                        contains(user.getLastName(), searchTerm) ||
                        contains(user.getPhone(), searchTerm))
                .collect(Collectors.toList());

        if (filteredUsers.isEmpty()) {
            throw new EntityNotFoundException("No se encontraron usuarios que coincidan con la búsqueda.");
        }

        return ResponseEntity.ok(filteredUsers);
    }

    public Boolean exist(String id) {
        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !id.equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        return userRepository.exist(id);
    }
}
