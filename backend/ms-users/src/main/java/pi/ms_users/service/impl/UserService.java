package pi.ms_users.service.impl;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
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

    public ResponseEntity<User> updateUser(User user) {
        try {
            Optional<User> users = userRepository.findById(user.getId());
            if (users.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User updated = userRepository.updateUser(user);
            return ResponseEntity.ok(updated);
        } catch (NotFoundException e) {
            // Manejo específico si un servicio REST externo devuelve 404
            System.err.println("Recurso no encontrado en servicio externo: " + e.getMessage());
            return ResponseEntity.notFound().build();

        } catch (BadRequestException e) {
            System.err.println("Error 400 - Bad Request al actualizar usuario en Keycloak");

            if (e.getResponse() != null) {
                try {
                    String errorBody = e.getResponse().readEntity(String.class);
                    System.err.println("Respuesta de Keycloak: " + errorBody);
                } catch (Exception ex) {
                    System.err.println("No se pudo leer el cuerpo de la respuesta: " + ex.getMessage());
                }
            } else {
                System.err.println("La excepción no contiene una respuesta HTTP.");
            }

            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
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

    private boolean contains(String field, String searchTerm) {
        return field != null && searchTerm != null &&
                field.toLowerCase().contains(searchTerm.toLowerCase());
    }
}
