package pi.ms_users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.service.interf.IContractIncreaseService;

import java.util.List;

@RestController
@RequestMapping("/contractIncreases")
@RequiredArgsConstructor
public class ContractIncreaseController {

    private final IContractIncreaseService contractIncreaseService;

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody @Valid ContractIncreaseDTO contractIncreaseDTO) {
        return contractIncreaseService.create(contractIncreaseDTO);
    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody @Valid ContractIncreaseDTO contractIncreaseDTO) {
        return contractIncreaseService.update(contractIncreaseDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return contractIncreaseService.delete(id);
    }

    @DeleteMapping("/deleteByContract/{contractId}")
    public ResponseEntity<String> deleteByContractId(@PathVariable Long contractId) {
        return contractIncreaseService.deleteByContractId(contractId);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<ContractIncreaseDTO> getById(@PathVariable Long id) {
        return contractIncreaseService.getById(id);
    }

    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<List<ContractIncreaseDTO>> getByContractId(@PathVariable Long contractId) {
        return contractIncreaseService.getByContractId(contractId);
    }

    @GetMapping("/getLast/{contractId}")
    public ResponseEntity<ContractIncreaseDTO> getLastByContractId(@PathVariable Long contractId) {
        return contractIncreaseService.getLastByContractId(contractId);
    }
}

