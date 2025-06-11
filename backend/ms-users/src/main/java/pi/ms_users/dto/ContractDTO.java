package pi.ms_users.dto;

import lombok.Data;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContractDTO {
    private Long id;
    private String userId;
    private Long propertyId;
    private ContractType contractType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ContractStatus contractStatus;
    private float increase;
    private Long increaseFrequency;
    private List<ContractIncreaseDTO> contractIncrease;
}
