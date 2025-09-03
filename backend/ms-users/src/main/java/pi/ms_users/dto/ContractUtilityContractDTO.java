package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.UtilityPeriodicityPayment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContractUtilityContractDTO {
    private Long id;
    private UtilityPeriodicityPayment periodicity;
    private BigDecimal initialAmount;
    private BigDecimal lastPaidAmount;
    private LocalDateTime lastPaidDate;
    private String notes;
    private Long utilityId;
    private List<ContractUtilityIncreaseGetDTO> increases;
}
