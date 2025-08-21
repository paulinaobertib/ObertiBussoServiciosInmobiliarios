package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.PaymentConcept;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.PaymentDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface IPaymentService {
    ResponseEntity<String> create(PaymentDTO paymentDTO);

    ResponseEntity<String> update(PaymentDTO paymentDTO);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<PaymentDTO> getById(Long id);

    ResponseEntity<List<PaymentDTO>> getByContract(Long contractId);

    ResponseEntity<List<PaymentDTO>> getByContractUtility(Long contractUtilityId);

    ResponseEntity<List<PaymentDTO>> getByCommission(Long commissionId);

    ResponseEntity<PaymentDTO> getLastByContract(Long contractId);

    ResponseEntity<PaymentDTO> getLastByContractUtility(Long contractUtilityId);

    ResponseEntity<PaymentDTO> getLastByCommission(Long commissionId);

    ResponseEntity<List<PaymentDTO>> getByDateRange(LocalDateTime from, LocalDateTime to);

    ResponseEntity<List<PaymentDTO>> getByDateRangeAndContract(Long contractId, LocalDateTime from, LocalDateTime to);

    ResponseEntity<List<PaymentDTO>> getByDateRangeAndUtility(Long contractUtilityId, LocalDateTime from, LocalDateTime to);

    ResponseEntity<List<PaymentDTO>> getByDateRangeAndCommission(Long commissionId, LocalDateTime from, LocalDateTime to);

    ResponseEntity<List<PaymentDTO>> getByConcept(PaymentConcept concept);

    ResponseEntity<List<PaymentDTO>> getByCurrency(PaymentCurrency currency);
}