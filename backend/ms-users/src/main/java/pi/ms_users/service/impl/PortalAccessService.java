package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.TenantPortalAccess;
import pi.ms_users.dto.portal.PortalAccessDTO;
import pi.ms_users.repository.ITenantPortalAccessRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.IPortalAccessService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortalAccessService implements IPortalAccessService {

    private final ITenantPortalAccessRepository portalAccessRepository;

    private final IUserRepository userRepository;

    private PortalAccessDTO toDTO(String userId) {
        return portalAccessRepository.findById(userId)
                .map(a -> new PortalAccessDTO(userId, a.isCanViewContracts(), a.isCanViewReceipts()))
                .orElse(new PortalAccessDTO(userId, true, true));
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<PortalAccessDTO> getMine() {
        String userId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.isTenant() && !SecurityUtils.isAdmin()) {
            return ResponseEntity.ok(new PortalAccessDTO(userId, false, false));
        }
        return ResponseEntity.ok(toDTO(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<PortalAccessDTO> getByUser(String userId) {
        if (!userRepository.exist(userId)) {
            throw new EntityNotFoundException("No se encontró el usuario.");
        }
        PortalAccessDTO dto = toDTO(userId);
        // sin rol de inquilino no entra al portal, aunque la fila diga otra cosa
        List<String> roles = userRepository.getUserRoles(userId);
        if (roles == null || roles.stream().noneMatch("tenant"::equalsIgnoreCase)) {
            dto.setCanViewContracts(false);
            dto.setCanViewReceipts(false);
        }
        return ResponseEntity.ok(dto);
    }

    @Override
    @Transactional
    public ResponseEntity<PortalAccessDTO> update(String userId, PortalAccessDTO dto) {
        if (!userRepository.exist(userId)) {
            throw new EntityNotFoundException("No se encontró el usuario.");
        }

        TenantPortalAccess access = portalAccessRepository.findById(userId).orElseGet(() -> {
            TenantPortalAccess a = new TenantPortalAccess();
            a.setUserId(userId);
            return a;
        });
        access.setCanViewContracts(dto.isCanViewContracts());
        access.setCanViewReceipts(dto.isCanViewReceipts());
        access.setUpdatedAt(LocalDateTime.now());
        portalAccessRepository.save(access);

        List<String> roles = userRepository.getUserRoles(userId);
        boolean isTenant = roles != null && roles.stream().anyMatch("tenant"::equalsIgnoreCase);
        boolean anyAccess = dto.isCanViewContracts() || dto.isCanViewReceipts();
        if (anyAccess && !isTenant) {
            userRepository.addRoleToUser(userId, "tenant");
        }

        return ResponseEntity.ok(new PortalAccessDTO(userId, access.isCanViewContracts(), access.isCanViewReceipts()));
    }
}
