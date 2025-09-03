package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.dto.ContractUtilityIncreaseDTO;
import pi.ms_users.dto.ContractUtilityIncreaseGetDTO;
import pi.ms_users.service.interf.IContractUtilityIncreaseService;

import java.util.List;

@RestController
@RequestMapping("/contractUtilityIncreases")
@RequiredArgsConstructor
public class ContractUtilityIncreaseController {

    private final IContractUtilityIncreaseService increaseService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody ContractUtilityIncreaseDTO dto) {
        return increaseService.create(dto);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody ContractUtilityIncreaseDTO dto) {
        return increaseService.update(dto);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return increaseService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<ContractUtilityIncreaseDTO> getById(@PathVariable Long id) {
        return increaseService.getById(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByContractUtility/{contractUtilityId}")
    public ResponseEntity<List<ContractUtilityIncreaseGetDTO>> getByContractUtility(@PathVariable Long contractUtilityId) {
        return increaseService.getByContractUtility(contractUtilityId);
    }
}

