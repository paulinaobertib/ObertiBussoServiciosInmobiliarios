package pi.ms_properties.repository.feign;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pi.ms_properties.dto.feign.NotificationDTO;

@Repository
@RequiredArgsConstructor
public class NotificationRepository {

    private final FeignUserRepository feignUserRepository;

    public void createNotification(NotificationDTO notificationDTO, Long propertyId) {
        feignUserRepository.createProperty(notificationDTO, propertyId);
    }
}
