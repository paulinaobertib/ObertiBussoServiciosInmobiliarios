package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.User;
import pi.ms_users.service.impl.UserService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<Optional<User>> findById(@PathVariable String id) {
        return userService.findById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<User>> findAll() {
        return userService.findAll();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/role/{id}")
    public ResponseEntity<List<String>> findRoles(@PathVariable String id) {
        return userService.getUserRoles(id);
    }

    @PreAuthorize("hasRole('user')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable String id) {
        return userService.deleteUserById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/role/{id}")
    public ResponseEntity<String> deleteRoleToUser(@PathVariable String id, @RequestParam String role) {
        return userService.deleteRoleToUser(id, role);
    }

    @PreAuthorize("hasRole('user')")
    @PutMapping("/update")
    public ResponseEntity<User> update(@RequestBody User user) {
        return userService.updateUser(user);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update/role/{id}")
    public ResponseEntity<List<String>> addRoleToUser(@PathVariable String id, @RequestParam String role) {
        return userService.addRoleToUser(id, role);
    }
}