package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Notification;
import pi.ms_users.dto.NotificationDTO;

import java.util.List;

public interface INotificationService {
    ResponseEntity<String> createProperty(NotificationDTO notificationDTO, Long propertyId);

    ResponseEntity<Notification> getById(Long id);

    ResponseEntity<List<Notification>> getAll();

    ResponseEntity<List<Notification>> getByUserId(String userId);
}
