package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.CommissionPaymentType;
import pi.ms_users.domain.CommissionStatus;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.CommissionDTO;
import pi.ms_users.dto.CommissionGetDTO;
import pi.ms_users.service.interf.ICommissionService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/commissions")
@RequiredArgsConstructor
public class CommissionController {

    private final ICommissionService commissionService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody CommissionDTO dto) {
        return commissionService.create(dto);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody CommissionDTO dto) {
        return commissionService.update(dto);
    }

    @PreAuthorize("hasRole('admin')")
    @PatchMapping("/updateStatus/{id}")
    public ResponseEntity<String> updateStatus(@PathVariable Long id, @RequestParam CommissionStatus status) {
        return commissionService.updateStatus(id, status);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return commissionService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<CommissionGetDTO> getById(@PathVariable Long id) {
        return commissionService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<CommissionGetDTO>> getAll() {
        return commissionService.getAll();
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<CommissionGetDTO> getByContractId(@PathVariable Long contractId) {
        return commissionService.getByContractId(contractId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/date")
    public ResponseEntity<List<CommissionGetDTO>> getByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return commissionService.getByDate(date);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/dateRange")
    public ResponseEntity<List<CommissionGetDTO>> getByDateRange(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return commissionService.getByDateRange(from, to);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/installments")
    public ResponseEntity<List<CommissionGetDTO>> getByInstallments(@RequestParam Integer installments) {
        return commissionService.getByInstallments(installments);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/status")
    public ResponseEntity<List<CommissionGetDTO>> getByStatus(@RequestParam CommissionStatus status) {
        return commissionService.getByStatus(status);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/paymentType")
    public ResponseEntity<List<CommissionGetDTO>> getByPaymentType(@RequestParam CommissionPaymentType paymentType) {
        return commissionService.getByPaymentType(paymentType);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/total/byStatus")
    public ResponseEntity<BigDecimal> getTotalAmountByStatus(@RequestParam CommissionStatus status, @RequestParam PaymentCurrency currency) {
        return commissionService.getTotalAmountByStatus(status, currency);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/total/byDateRange")
    public ResponseEntity<BigDecimal> getDateTotals(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to, @RequestParam PaymentCurrency currency) {
        return commissionService.getDateTotals(from, to, currency);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/total/byYearMonth")
    public ResponseEntity<Map<YearMonth, BigDecimal>> getYearMonthlyTotals(@RequestParam int year, @RequestParam PaymentCurrency currency) {
        return commissionService.getYearMonthlyTotals(year, currency);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/total/status")
    public ResponseEntity<Map<CommissionStatus, Long>> countByStatus() {
        return commissionService.countByStatus();
    }
}

