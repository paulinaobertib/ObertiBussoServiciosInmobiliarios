package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody CommissionDTO dto) {
        return commissionService.create(dto);
    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody CommissionDTO dto) {
        return commissionService.update(dto);
    }

    @PatchMapping("/updateStatus/{id}")
    public ResponseEntity<String> updateStatus(@PathVariable Long id, @RequestParam CommissionStatus status) {
        return commissionService.updateStatus(id, status);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return commissionService.delete(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<CommissionGetDTO> getById(@PathVariable Long id) {
        return commissionService.getById(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<CommissionGetDTO>> getAll() {
        return commissionService.getAll();
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<CommissionGetDTO> getByContractId(@PathVariable Long contractId) {
        return commissionService.getByContractId(contractId);
    }

    @GetMapping("/date")
    public ResponseEntity<List<CommissionGetDTO>> getByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return commissionService.getByDate(date);
    }

    @GetMapping("/dateRange")
    public ResponseEntity<List<CommissionGetDTO>> getByDateRange(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return commissionService.getByDateRange(from, to);
    }

    @GetMapping("/installments")
    public ResponseEntity<List<CommissionGetDTO>> getByInstallments(@RequestParam Integer installments) {
        return commissionService.getByInstallments(installments);
    }

    @GetMapping("/status")
    public ResponseEntity<List<CommissionGetDTO>> getByStatus(@RequestParam CommissionStatus status) {
        return commissionService.getByStatus(status);
    }

    @GetMapping("/paymentType")
    public ResponseEntity<List<CommissionGetDTO>> getByPaymentType(@RequestParam CommissionPaymentType paymentType) {
        return commissionService.getByPaymentType(paymentType);
    }

    @GetMapping("/total/byStatus")
    public ResponseEntity<BigDecimal> getTotalAmountByStatus(@RequestParam CommissionStatus status, @RequestParam PaymentCurrency currency) {
        return commissionService.getTotalAmountByStatus(status, currency);
    }

    @GetMapping("/total/byDateRange")
    public ResponseEntity<BigDecimal> getDateTotals(@RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to, @RequestParam PaymentCurrency currency) {
        return commissionService.getDateTotals(from, to, currency);
    }

    @GetMapping("/total/byYearMonth")
    public ResponseEntity<Map<YearMonth, BigDecimal>> getYearMonthlyTotals(@RequestParam int year, @RequestParam PaymentCurrency currency) {
        return commissionService.getYearMonthlyTotals(year, currency);
    }

    @GetMapping("/total/status")
    public ResponseEntity<Map<CommissionStatus, Long>> countByStatus() {
        return commissionService.countByStatus();
    }
}

