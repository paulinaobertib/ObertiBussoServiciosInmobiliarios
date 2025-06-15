package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.ContractIncreaseCurrency;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.service.interf.IContractService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final IContractService contractService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> createContract(@RequestBody ContractDTO contractDTO, @RequestParam BigDecimal amount, @RequestParam ContractIncreaseCurrency currency) {
        return contractService.create(contractDTO, amount, currency);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> updateContract(@RequestBody ContractDTO contractDTO) {
        return contractService.update(contractDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @PatchMapping("/updateStatus/{id}")
    public ResponseEntity<String> updateContractStatus(@PathVariable Long id) {
        return contractService.updateStatus(id);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteContract(@PathVariable Long id) {
        return contractService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<ContractDTO> getContractById(@PathVariable Long id) {
        return contractService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<ContractDTO>> getAll() {
        return contractService.getAll();
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ContractDTO>> getContractsByUserId(@PathVariable String userId) {
        return contractService.getByUserId(userId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<ContractDTO>> getContractsByPropertyId(@PathVariable Long propertyId) {
        return contractService.getByPropertyId(propertyId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/type")
    public ResponseEntity<List<ContractDTO>> getContractsByType(@RequestParam ContractType type) {
        return contractService.getByType(type);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/status")
    public ResponseEntity<List<ContractDTO>> getContractsByStatus(@RequestParam ContractStatus status) {
        return contractService.getByStatus(status);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/dateRange")
    public ResponseEntity<List<ContractDTO>> getContractsByDateRange(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return contractService.getByDateBetween(start, end);
    }
}

