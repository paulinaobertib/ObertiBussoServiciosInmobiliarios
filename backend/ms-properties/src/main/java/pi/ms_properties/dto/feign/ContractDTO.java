package pi.ms_properties.dto.feign;

import lombok.Data;

import java.time.LocalDateTime;

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
}
