package pi.ms_users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.PaymentConcept;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.PaymentDTO;
import pi.ms_users.service.interf.IPaymentService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody @Valid PaymentDTO body) {
        return paymentService.create(body);
    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody @Valid PaymentDTO body) {
        return paymentService.update(body);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return paymentService.delete(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<PaymentDTO> getById(@PathVariable Long id) {
        return paymentService.getById(id);
    }

    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<List<PaymentDTO>> getByContract(@PathVariable Long contractId) {
        return paymentService.getByContract(contractId);
    }

    @GetMapping("/getByUtility/{contractUtilityId}")
    public ResponseEntity<List<PaymentDTO>> getByContractUtility(@PathVariable Long contractUtilityId) {
        return paymentService.getByContractUtility(contractUtilityId);
    }

    @GetMapping("/getByCommission/{commissionId}")
    public ResponseEntity<List<PaymentDTO>> getByCommission(@PathVariable Long commissionId) {
        return paymentService.getByCommission(commissionId);
    }

    @GetMapping("/last/getByContract/{contractId}")
    public ResponseEntity<PaymentDTO> getLastByContract(@PathVariable Long contractId) {
        return paymentService.getLastByContract(contractId);
    }

    @GetMapping("/last/getByUtility/{contractUtilityId}")
    public ResponseEntity<PaymentDTO> getLastByContractUtility(@PathVariable Long contractUtilityId) {
        return paymentService.getLastByContractUtility(contractUtilityId);
    }

    @GetMapping("/last/getByCommission/{commissionId}")
    public ResponseEntity<PaymentDTO> getLastByCommission(@PathVariable Long commissionId) {
        return paymentService.getLastByCommission(commissionId);
    }

    @GetMapping("/getByRange")
    public ResponseEntity<List<PaymentDTO>> getByDateRange(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return paymentService.getByDateRange(from, to);
    }

    @GetMapping("/getByContract/range/{contractId}")
    public ResponseEntity<List<PaymentDTO>> getByDateRangeAndContract(@PathVariable Long contractId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return paymentService.getByDateRangeAndContract(contractId, from, to);
    }

    @GetMapping("/getByUtility/range/{contractUtilityId}")
    public ResponseEntity<List<PaymentDTO>> getByDateRangeAndUtility(@PathVariable Long contractUtilityId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return paymentService.getByDateRangeAndUtility(contractUtilityId, from, to);
    }

    @GetMapping("/getByCommission/range/{commissionId}")
    public ResponseEntity<List<PaymentDTO>> getByDateRangeAndCommission(@PathVariable Long commissionId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return paymentService.getByDateRangeAndCommission(commissionId, from, to);
    }

    @GetMapping("/getByConcept/{concept}")
    public ResponseEntity<List<PaymentDTO>> getByConcept(@PathVariable PaymentConcept concept) {
        return paymentService.getByConcept(concept);
    }

    @GetMapping("/getByCurrency/{currency}")
    public ResponseEntity<List<PaymentDTO>> getByCurrency(@PathVariable PaymentCurrency currency) {
        return paymentService.getByCurrency(currency);
    }
}
