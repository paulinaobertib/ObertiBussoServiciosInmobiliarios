package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.UtilityDTO;
import pi.ms_users.service.interf.IUtilityService;

import java.util.List;

@RestController
@RequestMapping("/utilities")
@RequiredArgsConstructor
public class UtilityController {

    private final IUtilityService utilityService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody UtilityDTO dto) {
        return utilityService.create(dto);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody UtilityDTO dto) {
        return utilityService.update(dto);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return utilityService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<UtilityDTO> getById(@PathVariable Long id) {
        return utilityService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<UtilityDTO>> getAll() {
        return utilityService.getAll();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByName")
    public ResponseEntity<UtilityDTO> getByName(@RequestParam String name) {
        return utilityService.getByName(name);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/contracts/{id}")
    public ResponseEntity<List<ContractSimpleDTO>> getContractsByUtility(@PathVariable Long id) {
        return utilityService.getContractsByUtility(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<List<UtilityDTO>> getByContract(@PathVariable Long contractId) {
        return utilityService.getByContract(contractId);
    }
}

