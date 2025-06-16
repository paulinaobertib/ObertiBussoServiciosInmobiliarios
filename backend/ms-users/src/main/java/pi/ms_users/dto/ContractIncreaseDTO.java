package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.ContractIncreaseCurrency;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ContractIncreaseDTO {
    private Long id;
    private LocalDateTime date;
    private BigDecimal amount;
    private ContractIncreaseCurrency currency;
    private Long contractId;
}
