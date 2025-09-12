package pi.ms_users.dto.email;

import lombok.Data;

@Data
public class EmailContractExpiredAdminDTO {
    private Long propertyId;
    private String tenant;
    private Long contractId;
}
