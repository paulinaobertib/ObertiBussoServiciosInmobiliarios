package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.UserNotificationPreference;

import java.util.List;

public interface IUserNotificationPreferenceRepository extends JpaRepository<UserNotificationPreference, Long> {
    @Query("select n from UserNotificationPreference n where n.userId = ?1")
    List<UserNotificationPreference> findByUserId(String userId);

    @Query("select n from UserNotificationPreference n where n.type = ?1")
    List<String> usersIdByType(NotificationType type);
}
