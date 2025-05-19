package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.UserNotificationPreference;
import pi.ms_users.service.interf.IUserNotificationPreferenceService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/preference")
public class UserNotificationPreferenceController {

    private final IUserNotificationPreferenceService userNotificationPreferenceService;

    // @PreAuthorize("hasAnyRole('admin', 'user')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody UserNotificationPreference preference) {
        return userNotificationPreferenceService.create(preference);
    }

    // @PreAuthorize("hasAnyRole('admin', 'user')")
    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestParam Boolean enabled) {
        return userNotificationPreferenceService.update(id, enabled);
    }

    // @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<UserNotificationPreference> getById(@PathVariable Long id) {
        return userNotificationPreferenceService.getById(id);
    }

    // @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserNotificationPreference>> getByUser(@PathVariable String userId) {
        return userNotificationPreferenceService.getByUser(userId);
    }

    // @PreAuthorize("hasRole('admin')")
    @GetMapping("/active")
    public ResponseEntity<List<String>> getByTypeAndTrue(@RequestParam NotificationType type) {
        return userNotificationPreferenceService.getByTypeAndTrue(type);
    }
}

