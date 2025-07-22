package pi.ms_users.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.Payment;
import pi.ms_users.dto.PaymentDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IPaymentRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.IPaymentService;
import org.springframework.security.access.AccessDeniedException;


import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("unused")
@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {

    private final IPaymentRepository paymentRepository;

    private final IContractRepository contractRepository;

    private final ObjectMapper objectMapper;

    @Override
    public ResponseEntity<String> createPayment(PaymentDTO paymentDTO) {
        Contract contract = contractRepository.findById(paymentDTO.getContractId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato"));
        
        Payment payment = objectMapper.convertValue(paymentDTO, Payment.class);
        payment.setContract(contract);
        paymentRepository.save(payment);

        return ResponseEntity.ok("Se ha guardado el pago");
    }

    @Override
    public ResponseEntity<String> updatePayment(PaymentDTO paymentDTO) {
        Contract contract = contractRepository.findById(paymentDTO.getContractId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato"));

        paymentRepository.findById(paymentDTO.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el pago que se solicita editar"));

        Payment payment = objectMapper.convertValue(paymentDTO, Payment.class);
        payment.setContract(contract);
        paymentRepository.save(payment);

        return ResponseEntity.ok("Se ha actualizado el pago");
    }

    @Override
    public ResponseEntity<String> deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el pago que se solicita eliminar"));
        paymentRepository.delete(payment);
        return ResponseEntity.ok("Se ha eliminado el pago");
    }

    @Override
    public ResponseEntity<Payment> getById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el pago solicitado"));

        if (SecurityUtils.isTenant() &&
                !payment.getContract().getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        return ResponseEntity.ok(payment);
    }

    @Override
    public ResponseEntity<List<Payment>> getByContractId(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato"));

        if (SecurityUtils.isTenant() &&
                !contract.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        List<Payment> payments = paymentRepository.findByContractId(contractId);
        return ResponseEntity.ok(payments);
    }

    @Override
    public ResponseEntity<List<Payment>> getByDate(Long contractId, LocalDateTime date) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato"));

        if (SecurityUtils.isTenant() &&
                !contract.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        List<Payment> payments = paymentRepository.findByDate(contractId, date);
        return ResponseEntity.ok(payments);
    }

    @Override
    public ResponseEntity<List<Payment>> getByDateBetween(Long contractId, LocalDateTime start, LocalDateTime end) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato"));

        if (SecurityUtils.isTenant() &&
                !contract.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        List<Payment> payments = paymentRepository.findByDateBetween(contractId, start, end);
        return ResponseEntity.ok(payments);
    }
}
