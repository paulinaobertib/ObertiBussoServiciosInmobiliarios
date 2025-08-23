package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.domain.PaymentCurrency;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContractGuarantorGetDTO {
    private Long id;
    private String userId;
    private Long propertyId;
    private ContractType contractType;
    private LocalDate startDate;
    private LocalDate endDate;
    private ContractStatus contractStatus;
    private PaymentCurrency currency;
    private BigDecimal initialAmount;
    private Integer adjustmentFrequencyMonths;
    private BigDecimal lastPaidAmount;
    private LocalDateTime lastPaidDate;
    private String note;
    private Boolean hasDeposit;
    private BigDecimal depositAmount;
    private String depositNote;
    private IncreaseIndexContractDTO adjustmentIndex;
    private List<ContractUtilityContractDTO> contractUtilities;
    private List<ContractIncreaseContractDTO> contractIncrease;
    private CommissionContractDTO commission;
    private List<PaymentContractDTO> payments;
}
