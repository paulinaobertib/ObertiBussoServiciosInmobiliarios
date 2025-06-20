package pi.ms_users.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EmailExpirationContract {
    private String from;
    private String to;
    private String title;
    private String firstName;
    private LocalDateTime endDate;
}
