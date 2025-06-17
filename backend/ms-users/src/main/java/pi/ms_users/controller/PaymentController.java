package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.Payment;
import pi.ms_users.service.interf.IPaymentService;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final IPaymentService paymentService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@RequestBody Payment payment) {
        return paymentService.createPayment(payment);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> updatePayment(@RequestBody Payment payment) {
        return paymentService.updatePayment(payment);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletePayment(@PathVariable Long id) {
        return paymentService.deletePayment(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        return paymentService.getById(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<Payment>> getByContractId(@PathVariable Long contractId) {
        return paymentService.getByContractId(contractId);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByDate")
    public ResponseEntity<List<Payment>> getByDate(@RequestParam("contract") Long contractId, @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        return paymentService.getByDate(contractId, date);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByDateBetween")
    public ResponseEntity<List<Payment>> getByDateBetween(@RequestParam Long contractId, @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start, @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return paymentService.getByDateBetween(contractId, start, end);
    }
}
