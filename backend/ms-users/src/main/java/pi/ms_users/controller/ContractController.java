package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractIncreaseCurrency;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.service.interf.IContractService;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final IContractService contractService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<?> createContract(@RequestBody Contract contract, @RequestParam BigDecimal amount, @RequestParam ContractIncreaseCurrency currency) {
        return contractService.create(contract, amount, currency);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<?> updateContract(@RequestBody Contract contract) {
        return contractService.update(contract);
    }

    @PreAuthorize("hasRole('admin')")
    @PatchMapping("/updateStatus/{id}")
    public ResponseEntity<?> updateContractStatus(@PathVariable Long id) {
        return contractService.updateStatus(id);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteContract(@PathVariable Long id) {
        return contractService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getContractById(@PathVariable Long id) {
        return contractService.getById(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getContractsByUserId(@PathVariable String userId) {
        return contractService.getByUserId(userId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getContractsByPropertyId(@PathVariable Long propertyId) {
        return contractService.getByPropertyId(propertyId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/type")
    public ResponseEntity<?> getContractsByType(@RequestParam ContractType type) {
        return contractService.getByType(type);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/status")
    public ResponseEntity<?> getContractsByStatus(@RequestParam ContractStatus status) {
        return contractService.getByStatus(status);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/dateRange/{contractId}")
    public ResponseEntity<?> getContractsByDateRange(@PathVariable Long contractId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return contractService.getByDateBetween(contractId, start, end);
    }
}

