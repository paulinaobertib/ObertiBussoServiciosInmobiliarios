package pi.ms_properties.dto.feign;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private NotificationType type;
    private LocalDateTime date;
}
