package pi.ms_users.dto.email;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmailUtilityAmountLoadedDTO {
    private String to;
    private String firstName;
    private String lastName;
    private String utilityName;
    private BigDecimal amount;
    private LocalDate dueDate;
}