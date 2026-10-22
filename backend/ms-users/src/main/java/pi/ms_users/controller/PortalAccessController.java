package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.dto.portal.PortalAccessDTO;
import pi.ms_users.service.interf.IPortalAccessService;

@RestController
@RequestMapping("/portalAccess")
@RequiredArgsConstructor
public class PortalAccessController {

    private final IPortalAccessService portalAccessService;

    @GetMapping("/me")
    public ResponseEntity<PortalAccessDTO> getMine() {
        return portalAccessService.getMine();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/{userId}")
    public ResponseEntity<PortalAccessDTO> getByUser(@PathVariable String userId) {
        return portalAccessService.getByUser(userId);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{userId}")
    public ResponseEntity<PortalAccessDTO> update(@PathVariable String userId, @RequestBody PortalAccessDTO dto) {
        return portalAccessService.update(userId, dto);
    }
}
