package pi.ms_users.dto.email;

import lombok.Data;

import java.util.List;

@Data
public class EmailContractExpiringSoonListAdminDTO {
    private List<ContractExpiringForAdminDTO> contracts;
}
