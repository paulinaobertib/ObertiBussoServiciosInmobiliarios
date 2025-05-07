package pi.ms_users.repository;

import pi.ms_users.domain.User;

import java.util.List;
import java.util.Optional;

public interface IUserRepository {
    Optional<User> findById(String id);
    List<User> findAll();
    void deleteUserById(String id);
    User updateUser(User user);
    List<String> getUserRoles(String id);
    List<String> addRoleToUser(String id, String role);
    void deleteRoleToUser(String id, String role);
}
