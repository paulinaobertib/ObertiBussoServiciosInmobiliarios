package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.Notification;
import pi.ms_users.dto.NotificationDTO;
import pi.ms_users.service.interf.INotificationService;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final INotificationService notificationService;

    @PostMapping("/create/property")
    public ResponseEntity<String> createProperty(@RequestBody NotificationDTO notificationDTO, @RequestParam Long propertyId) {
        return notificationService.createProperty(notificationDTO, propertyId);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<Notification> getById(@PathVariable Long id) {
        return notificationService.getById(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Notification>> getAll() {
        return notificationService.getAll();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getByUserId(@PathVariable String userId) {
        return notificationService.getByUserId(userId);
    }
}

