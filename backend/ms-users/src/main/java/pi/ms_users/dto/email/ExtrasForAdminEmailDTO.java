package pi.ms_users.dto.email;

import lombok.Data;

@Data
public class ExtrasForAdminEmailDTO {
    private Long contractId;
    private String tenantFullName;
    private String utilityName;
    private String periodicity;
}
