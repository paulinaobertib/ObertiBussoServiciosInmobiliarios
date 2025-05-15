package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.UserNotificationPreference;

import java.util.List;

public interface IUserNotificationPreferenceService {

    ResponseEntity<String> create(UserNotificationPreference userNotificationPreference);

    ResponseEntity<String> update(Long id, Boolean enabled);

    ResponseEntity<UserNotificationPreference> getById(Long id);

    ResponseEntity<List<UserNotificationPreference>> getByUser(String userId);

    ResponseEntity<List<String>> getByTypeAndTrue(NotificationType type);
}
