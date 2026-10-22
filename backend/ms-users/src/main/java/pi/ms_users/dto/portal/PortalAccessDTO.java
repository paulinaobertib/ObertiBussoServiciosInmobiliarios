package pi.ms_users.dto.portal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortalAccessDTO {
    private String userId;
    private boolean canViewContracts;
    private boolean canViewReceipts;
}
