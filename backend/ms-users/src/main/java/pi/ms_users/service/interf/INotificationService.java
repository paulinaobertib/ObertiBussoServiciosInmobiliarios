package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Notification;
import pi.ms_users.dto.NotificationDTO;

import java.util.List;

public interface INotificationService {
    ResponseEntity<String> createProperty(NotificationDTO notificationDTO, Long propertyId);

    ResponseEntity<?> getById(Long id);

    ResponseEntity<?> getAll();

    ResponseEntity<?> getByUserId(String userId);
}
