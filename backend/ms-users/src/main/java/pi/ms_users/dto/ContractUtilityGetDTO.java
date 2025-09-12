package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.Payment;
import pi.ms_users.domain.UtilityPeriodicityPayment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContractUtilityGetDTO {
    private Long id;
    private UtilityPeriodicityPayment periodicity;
    private BigDecimal initialAmount;
    private BigDecimal lastPaidAmount;
    private LocalDateTime lastPaidDate;
    private String notes;
    private Long contractId;
    private Long utilityId;
    private List<Payment> paymentList;
    private List<ContractUtilityIncreaseGetDTO> increases;
}
