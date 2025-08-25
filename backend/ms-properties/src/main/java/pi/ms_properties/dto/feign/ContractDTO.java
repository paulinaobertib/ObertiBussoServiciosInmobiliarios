package pi.ms_properties.dto.feign;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Currency;
import java.util.List;
import java.util.Set;

@Data
public class ContractDTO {
    private Long id;
    private String userId;
    private Long propertyId;
    private ContractType contractType;
    private LocalDate startDate;
    private LocalDate endDate;
    private ContractStatus contractStatus;
    private Currency currency;
    private BigDecimal initialAmount;
    private Integer adjustmentFrequencyMonths;
    private BigDecimal lastPaidAmount;
    private LocalDateTime lastPaidDate;
    private String note;
    private Long adjustmentIndexId;
    private List<Long> contractUtilitiesIds;
    private Long commissionId;
    private List<Long> paymentsIds;
    private Set<Long> guarantorsIds;
}
