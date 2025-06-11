package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Payment;

import java.time.LocalDateTime;

public interface IPaymentService {
    ResponseEntity<?> createPayment(Payment payment);

    ResponseEntity<?> updatePayment(Payment payment);

    ResponseEntity<?> deletePayment(Long id);

    ResponseEntity<?> getById(Long id);

    ResponseEntity<?> getByContractId(Long contractId);

    ResponseEntity<?> getByDate(Long contractId, LocalDateTime date);

    ResponseEntity<?> getByDateBetween(Long contractId, LocalDateTime start, LocalDateTime end);
}
