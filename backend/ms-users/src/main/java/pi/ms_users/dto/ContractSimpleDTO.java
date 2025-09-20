package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.domain.PaymentCurrency;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
public class ContractSimpleDTO {
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
    private Long adjustmentIndexId;
    private List<Long> contractUtilitiesIds;
    private Long commissionId;
    private List<Long> paymentsIds;
    private Set<Long> guarantorsIds;
}
