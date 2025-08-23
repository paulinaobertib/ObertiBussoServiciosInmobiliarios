package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.PaymentConcept;
import pi.ms_users.domain.PaymentCurrency;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentContractDTO {
    private Long id;
    private PaymentCurrency paymentCurrency;
    private BigDecimal amount;
    private LocalDateTime date;
    private String description;
    private PaymentConcept concept;
    private Long contractUtilityId;
    private Long commissionId;
}
