package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.UserNotificationPreference;

import java.util.List;

public interface IUserNotificationPreferenceService {
    ResponseEntity<?> create(UserNotificationPreference userNotificationPreference);

    ResponseEntity<?> update(Long id, Boolean enabled);

    ResponseEntity<?> getById(Long id);

    ResponseEntity<?> getByUser(String userId);

    ResponseEntity<?> getByTypeAndTrue(NotificationType type);
}
