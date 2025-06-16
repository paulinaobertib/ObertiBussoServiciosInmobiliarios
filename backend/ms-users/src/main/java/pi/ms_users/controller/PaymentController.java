package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.Payment;
import pi.ms_users.service.interf.IPaymentService;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final IPaymentService paymentService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody Payment payment) {
        return paymentService.createPayment(payment);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<?> updatePayment(@RequestBody Payment payment) {
        return paymentService.updatePayment(payment);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        return paymentService.deletePayment(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return paymentService.getById(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<?> getByContractId(@PathVariable Long contractId) {
        return paymentService.getByContractId(contractId);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getByDate")
    public ResponseEntity<?> getByDate(@RequestParam("contract") Long contractId, @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        return paymentService.getByDate(contractId, date);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getByDateBetween")
    public ResponseEntity<?> getByDateBetween(@RequestParam Long contractId, @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start, @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return paymentService.getByDateBetween(contractId, start, end);
    }
}
