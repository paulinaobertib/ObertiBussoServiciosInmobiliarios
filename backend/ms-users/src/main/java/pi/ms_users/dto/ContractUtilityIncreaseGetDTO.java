package pi.ms_users.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ContractUtilityIncreaseGetDTO {
    private Long id;
    private LocalDate adjustmentDate;
    private BigDecimal amount;
}