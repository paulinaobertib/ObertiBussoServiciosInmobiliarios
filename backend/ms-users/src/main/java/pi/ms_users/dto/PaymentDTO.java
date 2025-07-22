package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.PaymentCurrency;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentDTO {
    private Long id;
    private LocalDateTime date;
    private BigDecimal amount;
    private PaymentCurrency paymentCurrency;
    private String description;
    private Long contractId;
}