package pi.ms_users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.dto.ContractGetDTO;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.service.interf.IContractService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final IContractService contractService;

    @PostMapping("/create")
    public ResponseEntity<String> create(@Valid @RequestBody ContractDTO dto) {
        return contractService.create(dto);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @Valid @RequestBody ContractDTO dto) {
        dto.setId(id);
        return contractService.update(dto);
    }

    @PatchMapping("/updateStatus/{id}")
    public ResponseEntity<String> updateStatus(@PathVariable Long id) {
        return contractService.updateStatus(id);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return contractService.delete(id);
    }

    @DeleteMapping("/deleteByProperty/{propertyId}")
    public ResponseEntity<String> deleteByProperty(@PathVariable Long propertyId) {
        return contractService.deleteByPropertyId(propertyId);
    }

    @DeleteMapping("/deleteByUser/{userId}")
    public ResponseEntity<String> deleteByUser(@PathVariable String userId) {
        return contractService.deleteByUserId(userId);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<ContractGetDTO> getById(@PathVariable Long id) {
        return contractService.getById(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<ContractGetDTO>> getAll() {
        return contractService.getAll();
    }

    @GetMapping("/getByUser/{userId}")
    public ResponseEntity<List<ContractGetDTO>> getByUser(@PathVariable String userId) {
        return contractService.getByUserId(userId);
    }

    @GetMapping("/getByStatus")
    public ResponseEntity<List<ContractGetDTO>> getByStatus(@RequestParam ContractStatus status) {
        return contractService.getByStatus(status);
    }

    @GetMapping("/getByType")
    public ResponseEntity<List<ContractGetDTO>> getByType(@RequestParam ContractType type) {
        return contractService.getByType(type);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ContractGetDTO>> getActiveContracts() {
        return contractService.getActiveContracts();
    }

    @GetMapping("/getByProperty/{propertyId}")
    public ResponseEntity<List<ContractGetDTO>> getByProperty(@PathVariable Long propertyId) {
        return contractService.getByProperty(propertyId);
    }

    @GetMapping("/getByPropertyMS/{propertyId}")
    public ResponseEntity<List<ContractSimpleDTO>> getByPropertyForMS(@PathVariable Long propertyId) {
        return contractService.getByPropertyForMS(propertyId);
    }

    @GetMapping("/getByDate")
    public ResponseEntity<List<ContractGetDTO>> getByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return contractService.getByDate(date);
    }

    @GetMapping("/getByDateRange")
    public ResponseEntity<List<ContractGetDTO>> getByDateRange(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return contractService.getByDateRange(from, to);
    }

    @GetMapping("/expiringWithinDays")
    public ResponseEntity<List<ContractGetDTO>> getContractsExpiringWithin(@RequestParam int days) {
        return contractService.getContractsExpiringWithin(days);
    }

    @GetMapping("/endingOn")
    public ResponseEntity<List<ContractGetDTO>> getContractsEndingDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return contractService.getContractsEndingDate(date);
    }

    @GetMapping("/endingBetween")
    public ResponseEntity<List<ContractGetDTO>> getContractsEndingBetween(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return contractService.getContractsEndingBetween(from, to);
    }
}