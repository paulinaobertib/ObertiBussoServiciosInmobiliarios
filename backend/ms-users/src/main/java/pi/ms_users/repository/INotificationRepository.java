package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.Notification;

import java.util.List;

@Repository
public interface INotificationRepository extends JpaRepository<Notification, Long> {
    @Query("select n from Notification n where n.userId = ?1")
    List<Notification> findByUserId(String userId);
}
