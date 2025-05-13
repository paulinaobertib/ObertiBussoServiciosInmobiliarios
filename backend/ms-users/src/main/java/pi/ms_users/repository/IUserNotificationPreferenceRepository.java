package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.UserNotificationPreference;

import java.util.List;

public interface IUserNotificationPreferenceRepository extends JpaRepository<UserNotificationPreference, Long> {
    @Query("select n from UserNotificationPreference n where n.userId = ?1")
    List<UserNotificationPreference> findByUserId(String userId);

    @Query("select n from UserNotificationPreference n where n.userId = ?1 and n.type = ?2")
    UserNotificationPreference findByUserIdAndType(String userId, NotificationType type);

    @Query("select n.userId from UserNotificationPreference n where n.type = ?1 and n.enabled = false")
    List<String> usersIdByType(NotificationType type);

    @Query("select n.userId from UserNotificationPreference n where n.type = ?1 and n.enabled = true")
    List<String> usersIdByTypeTrue(NotificationType type);
}
