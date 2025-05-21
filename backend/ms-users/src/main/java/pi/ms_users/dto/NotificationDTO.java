package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.NotificationType;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private NotificationType type;
    private LocalDateTime date;
}
