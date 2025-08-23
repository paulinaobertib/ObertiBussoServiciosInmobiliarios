package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.PaymentCurrency;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ContractIncreaseContractDTO {
    private Long id;
    private LocalDateTime date;
    private PaymentCurrency currency;
    private BigDecimal amount;
    private BigDecimal adjustment;
    private String note;
    private LocalDateTime periodFrom;
    private LocalDateTime periodTo;
    private Long indexId;
}
