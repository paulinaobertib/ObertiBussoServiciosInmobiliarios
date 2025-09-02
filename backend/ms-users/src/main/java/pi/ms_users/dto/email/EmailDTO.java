package pi.ms_users.dto.email;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EmailDTO {
    private String from;
    private String to;
    private String title;
    private String description;
    private String phone;
    private String firstName;
    private String lastName;
    private LocalDateTime date;
}
