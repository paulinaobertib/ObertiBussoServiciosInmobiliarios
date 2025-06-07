package pi.ms_users.service.impl;

import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.User;
import pi.ms_users.repository.UserRepository.IUserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final IUserRepository userRepository;

    public ResponseEntity<Optional<User>> findById(String id) {
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(user);
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<List<User>> findAll() {
        try {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<String> deleteUserById(String id) {
        try {
            userRepository.deleteUserById(id);
            return ResponseEntity.ok("Se ha eliminado el usuario");
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<?> updateUser(User user) {
        try {
            Optional<User> users = userRepository.findById(user.getId());
            if (users.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
            }

            User updated = userRepository.updateUser(user);
            return ResponseEntity.ok(updated);

        } catch (ClientErrorException e) {
            int status = e.getResponse().getStatus();
            String errorBody;
            try {
                errorBody = e.getResponse().readEntity(String.class);
            } catch (Exception ex) {
                errorBody = "No se pudo leer el cuerpo de la respuesta de Keycloak.";
            }

            if (status == 409) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Conflicto al actualizar el usuario: " + errorBody);
            }

            return ResponseEntity.status(status)
                    .body("Error al actualizar el usuario en Keycloak: " + errorBody);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno al actualizar el usuario: " + e.getMessage());
        }
    }

    public ResponseEntity<List<String>> getUserRoles(String id) {
        try {
            Optional<User> users = userRepository.findById(id);
            if (users.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            List<String> roles = userRepository.getUserRoles(id);
            if (roles.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<List<String>> addRoleToUser(String id, String role) {
        try {
            Optional<User> users = userRepository.findById(id);
            if (users.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            List<String> roles = userRepository.addRoleToUser(id, role);
            if (roles.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<String> deleteRoleToUser(String id, String role) {
        try {
            Optional<User> users = userRepository.findById(id);
            if (users.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            userRepository.deleteRoleToUser(id, role);
            return ResponseEntity.ok("Se le ha eliminado el rol seleccionado al usuario");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private boolean contains(String field, String searchTerm) {
        return field != null && searchTerm != null &&
                field.toLowerCase().contains(searchTerm.toLowerCase());
    }

    public ResponseEntity<List<User>> searchUsersByText(String searchTerm) {
        try {
            List<User> allUsers = userRepository.findAll();

            List<User> filteredUsers = allUsers.stream()
                    .filter(user -> contains(user.getUsername(), searchTerm) ||
                            contains(user.getMail(), searchTerm) ||
                            contains(user.getFirstName(), searchTerm) ||
                            contains(user.getLastName(), searchTerm) ||
                            contains(user.getPhone(), searchTerm))
                    .collect(Collectors.toList());

            if (filteredUsers.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(filteredUsers);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public Boolean exist(String id) {
        return userRepository.exist(id);
    }
}
