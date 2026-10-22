package pi.ms_users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.dto.ContractGetDTO;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.feign.Status;
import pi.ms_users.service.interf.IContractService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final IContractService contractService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@Valid @RequestBody ContractDTO dto) {
        return contractService.create(dto);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @Valid @RequestBody ContractDTO dto) {
        dto.setId(id);
        return contractService.update(dto);
    }

    @PreAuthorize("hasRole('admin')")
    @PatchMapping("/updateStatus/{id}")
    public ResponseEntity<String> updateStatus(@PathVariable Long id) {
        return contractService.updateStatus(id);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return contractService.delete(id);
    }

    @PreAuthorize("hasRole('admin') or (hasRole('tenant') and @contractAccess.canViewContract(#id))")
    @GetMapping("/getById/{id}")
    public ResponseEntity<ContractGetDTO> getById(@PathVariable Long id) {
        return contractService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<ContractGetDTO>> getAll() {
        return contractService.getAll();
    }

    @PreAuthorize("hasRole('admin') or (hasRole('tenant') and @contractAccess.isCurrentUser(#userId) and @contractAccess.canViewContracts())")
    @GetMapping("/getByUser/{userId}")
    public ResponseEntity<List<ContractGetDTO>> getByUser(@PathVariable String userId) {
        return contractService.getByUserId(userId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByStatus")
    public ResponseEntity<List<ContractGetDTO>> getByStatus(@RequestParam ContractStatus status) {
        return contractService.getByStatus(status);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByType")
    public ResponseEntity<List<ContractGetDTO>> getByType(@RequestParam ContractType type) {
        return contractService.getByType(type);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/active")
    public ResponseEntity<List<ContractGetDTO>> getActiveContracts() {
        return contractService.getActiveContracts();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByProperty/{propertyId}")
    public ResponseEntity<List<ContractGetDTO>> getByProperty(@PathVariable Long propertyId) {
        return contractService.getByProperty(propertyId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByPropertyMS/{propertyId}")
    public ResponseEntity<List<ContractSimpleDTO>> getByPropertyForMS(@PathVariable Long propertyId) {
        return contractService.getByPropertyForMS(propertyId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByDate")
    public ResponseEntity<List<ContractGetDTO>> getByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return contractService.getByDate(date);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByDateRange")
    public ResponseEntity<List<ContractGetDTO>> getByDateRange(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return contractService.getByDateRange(from, to);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/expiringWithinDays")
    public ResponseEntity<List<ContractGetDTO>> getContractsExpiringWithin(@RequestParam int days) {
        return contractService.getContractsExpiringWithin(days);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/endingOn")
    public ResponseEntity<List<ContractGetDTO>> getContractsEndingDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return contractService.getContractsEndingDate(date);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/endingBetween")
    public ResponseEntity<List<ContractGetDTO>> getContractsEndingBetween(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return contractService.getContractsEndingBetween(from, to);
    }

    @PreAuthorize("hasAnyRole('admin')")
    @PutMapping("/propertyContractStatus/{propertyId}/{contractId}")
    public ResponseEntity<String> updatePropertyStatusAndContract(@PathVariable Long propertyId, @PathVariable Long contractId, @RequestParam Status status) {
        return contractService.updatePropertyStatusAndContract(propertyId, contractId, status);
    }
}