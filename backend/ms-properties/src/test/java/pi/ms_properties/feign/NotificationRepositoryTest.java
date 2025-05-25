package pi.ms_properties.feign;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.dto.feign.NotificationDTO;
import pi.ms_properties.dto.feign.NotificationType;
import pi.ms_properties.repository.feign.FeignUserRepository;
import pi.ms_properties.repository.feign.NotificationRepository;

import java.time.LocalDateTime;

@ExtendWith(MockitoExtension.class)
public class NotificationRepositoryTest {

    @Mock
    private FeignUserRepository feignUserRepository;

    @InjectMocks
    private NotificationRepository notificationRepository;

    // casos de exito

    @Test
    void createNotification_callsFeignClientSuccessfully() {
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.setType(NotificationType.ALQUILER);
        notificationDTO.setDate(LocalDateTime.now());

        notificationRepository.createNotification(notificationDTO, 1L);

        verify(feignUserRepository, times(1)).createProperty(notificationDTO, 1L);
    }

    // casos de error

    @Test
    void createNotification_handlesFeignClientException() {
        NotificationDTO notificationDTO = new NotificationDTO();
        notificationDTO.setType(NotificationType.ALQUILER);
        notificationDTO.setDate(LocalDateTime.now());

        doThrow(new RuntimeException("Feign client error")).when(feignUserRepository).createProperty(notificationDTO, 1L);

        assertThrows(RuntimeException.class, () -> notificationRepository.createNotification(notificationDTO, 1L));

        verify(feignUserRepository, times(1)).createProperty(notificationDTO, 1L);
    }
}
