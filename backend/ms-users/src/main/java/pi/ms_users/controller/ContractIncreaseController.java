package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.dto.ContractIncreaseDTOContractGet;
import pi.ms_users.service.interf.IContractIncreaseService;

import java.util.List;

@RestController
@RequestMapping("/contractIncreases")
@RequiredArgsConstructor
public class ContractIncreaseController {

    private final IContractIncreaseService contractIncreaseService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody ContractIncreaseDTO contractIncreaseDTO) {
        return contractIncreaseService.create(contractIncreaseDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return contractIncreaseService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<ContractIncreaseDTO> getById(@PathVariable Long id) {
        return contractIncreaseService.getById(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<ContractIncreaseDTOContractGet>> getByContract(@PathVariable Long contractId) {
        return contractIncreaseService.getByContract(contractId);
    }
}
