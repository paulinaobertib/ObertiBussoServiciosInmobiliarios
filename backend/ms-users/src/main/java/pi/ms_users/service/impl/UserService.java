package pi.ms_users.service.impl;

import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.User;
import pi.ms_users.repository.IUserRepository;

import java.util.List;
import java.util.Optional;

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
        } catch (Exception e) {
            e.printStackTrace();
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
        } catch (BadRequestException e) {
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
}
