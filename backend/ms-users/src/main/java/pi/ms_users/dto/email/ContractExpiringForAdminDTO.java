package pi.ms_users.dto.email;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ContractExpiringForAdminDTO {
    private Long contractId;
    private String tenantFullName;
    private LocalDate endDate;
}
