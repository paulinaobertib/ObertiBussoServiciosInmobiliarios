package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.Notification;
import pi.ms_users.dto.NotificationDTO;
import pi.ms_users.service.interf.INotificationService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
public class NotificationController {

    private final INotificationService notificationService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create/property")
    public ResponseEntity<String> createProperty(@RequestBody NotificationDTO notificationDTO, @RequestParam Long propertyId) {
        return notificationService.createProperty(notificationDTO, propertyId);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<Notification> getById(@PathVariable Long id) {
        return notificationService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<Notification>> getAll() {
        return notificationService.getAll();
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getByUserId(@PathVariable String userId) {
        return notificationService.getByUserId(userId);
    }
}

