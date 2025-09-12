package pi.ms_users.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ContractUtilityIncreaseDTO {
    private Long id;
    private LocalDate adjustmentDate;
    private BigDecimal amount;
    private Long contractUtilityId;
}
