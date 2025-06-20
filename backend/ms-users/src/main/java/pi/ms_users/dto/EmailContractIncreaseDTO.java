package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.ContractIncreaseCurrency;

import java.math.BigDecimal;

@Data
public class EmailContractIncreaseDTO {
    private String from;
    private String to;
    private String title;
    private String firstName;
    private BigDecimal amount;
    private Long frequency;
    private float increase;
    private ContractIncreaseCurrency currency;
}
