package pi.ms_users.dto.email;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ContractToIncreaseForAdminEmailDTO {
    private Long contractId;
    private String tenantFullName;
    private LocalDate increaseDate;
    private String indexName;
}
