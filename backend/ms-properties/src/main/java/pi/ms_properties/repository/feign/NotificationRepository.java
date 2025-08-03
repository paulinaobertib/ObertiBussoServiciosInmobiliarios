package pi.ms_properties.repository.feign;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pi.ms_properties.dto.feign.NotificationDTO;
import pi.ms_properties.dto.feign.NotificationType;

@Repository
@RequiredArgsConstructor
public class NotificationRepository {

    private final FeignUserRepository feignUserRepository;

    public void createNotification(NotificationDTO notificationDTO, Long propertyId) {
        feignUserRepository.createProperty(notificationDTO, propertyId);
    }

    public void createPropertyInterest(String userId, NotificationType type, Long propertyId) {
        feignUserRepository.createPropertyInterest(userId, type, propertyId);
    }
}
