package pi.ms_users.service.impl;

import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionSystemException;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.Payment;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IPaymentRepository;
import pi.ms_users.service.interf.IPaymentService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {

    private final IPaymentRepository paymentRepository;

    private final IContractRepository contractRepository;

    @Override
    public ResponseEntity<?> createPayment(Payment payment) {
        try {
            Optional<Contract> contract = contractRepository.findById(payment.getContract().getId());
            if (contract.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato");
            }
            paymentRepository.save(payment);
            return ResponseEntity.ok("Se ha guardado el pago");

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updatePayment(Payment payment) {
        try {
            Optional<Contract> contract = contractRepository.findById(payment.getContract().getId());
            if (contract.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato");
            }

            Optional<Payment> paymentOptional = paymentRepository.findById(payment.getId());
            if (paymentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el pago que se solicita editar");
            }

            paymentRepository.save(payment);
            return ResponseEntity.ok("Se ha actualizado el pago");

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> deletePayment(Long id) {
        try {
            Optional<Payment> paymentOptional = paymentRepository.findById(id);
            if (paymentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el pago que se solicita eliminar");
            }
            paymentRepository.delete(paymentOptional.get());
            return ResponseEntity.ok("Se ha eliminado el pago");

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getById(Long id) {
        try {
            Optional<Payment> paymentOptional = paymentRepository.findById(id);
            if (paymentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el pago que se solicita eliminar");
            } else {
                return ResponseEntity.ok(paymentOptional.get());
            }
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getByContractId(Long contractId) {
        try {
            Optional<Contract> contract = contractRepository.findById(contractId);
            if (contract.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato");
            }
            List<Payment> payments = paymentRepository.findByContractId(contractId);
            return ResponseEntity.ok(payments);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getByDate(Long contractId, LocalDateTime date) {
        try {
            Optional<Contract> contract = contractRepository.findById(contractId);
            if (contract.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato");
            }
            List<Payment> payments = paymentRepository.findByDate(contractId, date);
            return ResponseEntity.ok(payments);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getByDateBetween(Long contractId, LocalDateTime start, LocalDateTime end) {
        try {
            Optional<Contract> contract = contractRepository.findById(contractId);
            if (contract.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato");
            }
            List<Payment> payments = paymentRepository.findByDateBetween(contractId, start, end);
            return ResponseEntity.ok(payments);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }
}
