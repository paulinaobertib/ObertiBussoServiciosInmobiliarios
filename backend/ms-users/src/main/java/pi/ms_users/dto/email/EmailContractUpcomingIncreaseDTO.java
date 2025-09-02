package pi.ms_users.dto.email;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmailContractUpcomingIncreaseDTO {
    private String to;
    private String firstName;
    private String lastName;
    private LocalDate increaseDate;
    private BigDecimal newAmount;
    private String currency;
    private String index;
}
