package pi.ms_users.dto.email;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmailContractPaymentReminderDTO {
    private String to;
    private String firstName;
    private String lastName;
    private LocalDate dueDate;
    private BigDecimal amount;
    private String currency;
}