package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Payment;

import java.time.LocalDateTime;
import java.util.List;

public interface IPaymentService {
    ResponseEntity<String> createPayment(Payment payment);

    ResponseEntity<String> updatePayment(Payment payment);

    ResponseEntity<String> deletePayment(Long id);

    ResponseEntity<Payment> getById(Long id);

    ResponseEntity<List<Payment>> getByContractId(Long contractId);

    ResponseEntity<List<Payment>> getByDate(Long contractId, LocalDateTime date);

    ResponseEntity<List<Payment>> getByDateBetween(Long contractId, LocalDateTime start, LocalDateTime end);
}