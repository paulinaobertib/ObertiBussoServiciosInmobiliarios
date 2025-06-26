package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import pi.ms_users.domain.User;

import java.util.List;
import java.util.Map;

public interface IUserService {
    ResponseEntity<String> createUser(String firstName, String lastName, String email, String phone);

    Map<String, String> getUserInfo(Jwt jwt);

    ResponseEntity<User> findById(String id);

    ResponseEntity<List<User>> findTenat();

    ResponseEntity<List<User>> findAll();

    ResponseEntity<String> deleteUserById(String id);

    ResponseEntity<User> updateUser(User user);

    ResponseEntity<List<String>> getUserRoles(String id);

    ResponseEntity<List<String>> addRoleToUser(String id, String role);

    ResponseEntity<String> deleteRoleToUser(String id, String role);

    ResponseEntity<List<User>> searchUsersByText(String searchTerm);

    Boolean exist(String id);
}
