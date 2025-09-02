package pi.ms_users.dto.email;

import lombok.Data;

import java.time.LocalDate;

@Data
public class EmailUtilityPaymentReminderDTO {
    private String to;
    private String firstName;
    private String lastName;
    private String utilityName;
    private LocalDate dueDate;
}
