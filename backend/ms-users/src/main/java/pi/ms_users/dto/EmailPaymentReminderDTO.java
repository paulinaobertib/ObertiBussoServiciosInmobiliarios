package pi.ms_users.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmailPaymentReminderDTO {
    private String to;
    private String firstName;
    private BigDecimal amount;
    private LocalDate dueDate;
    private ContractIncreaseCurrency currency;
}
