package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.dto.portal.PortalAccessDTO;

public interface IPortalAccessService {
    ResponseEntity<PortalAccessDTO> getMine();

    ResponseEntity<PortalAccessDTO> getByUser(String userId);

    ResponseEntity<PortalAccessDTO> update(String userId, PortalAccessDTO dto);
}
