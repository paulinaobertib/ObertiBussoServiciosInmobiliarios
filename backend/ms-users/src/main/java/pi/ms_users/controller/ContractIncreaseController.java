package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.ContractIncrease;
import pi.ms_users.domain.ContractIncreaseCurrency;
import pi.ms_users.service.interf.IContractIncreaseService;

@RestController
@RequestMapping("/contractIncreases")
@RequiredArgsConstructor
public class ContractIncreaseController {

    private final IContractIncreaseService contractIncreaseService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody ContractIncrease contractIncrease) {
        return contractIncreaseService.create(contractIncrease);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return contractIncreaseService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return contractIncreaseService.getById(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<?> getByContract(@PathVariable Long contractId) {
        return contractIncreaseService.getByContract(contractId);
    }
}
