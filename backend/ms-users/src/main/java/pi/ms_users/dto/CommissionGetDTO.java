package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.CommissionPaymentType;
import pi.ms_users.domain.CommissionStatus;
import pi.ms_users.domain.Payment;
import pi.ms_users.domain.PaymentCurrency;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CommissionGetDTO {
    private Long id;
    private PaymentCurrency currency;
    private BigDecimal totalAmount;
    private LocalDate date;
    private CommissionPaymentType paymentType;
    private Integer installments;
    private CommissionStatus status;
    private String note;
    private Long contractId;
    private List<Payment> payments;
}
