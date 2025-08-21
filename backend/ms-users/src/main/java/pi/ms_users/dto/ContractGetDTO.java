package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContractGetDTO {
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
    private IncreaseIndex adjustmentIndex;
    private List<ContractUtility> contractUtilities;
    private List<ContractIncrease> contractIncrease;
    private Commission commission;
    private List<Payment> payments;
}