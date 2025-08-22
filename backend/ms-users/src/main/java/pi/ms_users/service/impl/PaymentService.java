package pi.ms_users.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.*;
import pi.ms_users.dto.PaymentDTO;
import pi.ms_users.repository.ICommissionRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IContractUtilityRepository;
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

    private final IContractUtilityRepository contractUtilityRepository;

    private final ICommissionRepository commissionRepository;

    @PersistenceContext
    private EntityManager em;

    public PaymentDTO toDTO(Payment entity) {
        if (entity == null) return null;

        PaymentDTO dto = new PaymentDTO();
        dto.setId(entity.getId());
        dto.setPaymentCurrency(entity.getPaymentCurrency());
        dto.setAmount(entity.getAmount());
        dto.setDate(entity.getDate());
        dto.setDescription(entity.getDescription());
        dto.setConcept(entity.getConcept());
        dto.setContractId(entity.getContract() != null ? entity.getContract().getId() : null);
        dto.setContractUtilityId(entity.getContractUtility() != null ? entity.getContractUtility().getId() : null);
        dto.setCommissionId(entity.getCommission() != null ? entity.getCommission().getId() : null);

        return dto;
    }

    public Payment toEntity(PaymentDTO dto) {
        if (dto == null) return null;

        Payment entity = new Payment();
        entity.setId(dto.getId());
        entity.setPaymentCurrency(dto.getPaymentCurrency());
        entity.setAmount(dto.getAmount());
        entity.setDate(dto.getDate());
        entity.setDescription(dto.getDescription());
        entity.setConcept(dto.getConcept());

        if (dto.getContractId() != null) {
            entity.setContract(em.getReference(Contract.class, dto.getContractId()));
        }
        if (dto.getContractUtilityId() != null) {
            entity.setContractUtility(em.getReference(ContractUtility.class, dto.getContractUtilityId()));
        }
        if (dto.getCommissionId() != null) {
            entity.setCommission(em.getReference(Commission.class, dto.getCommissionId()));
        }

        return entity;
    }

    private void simpleValid(PaymentDTO dto) {
        if (dto.getContractId() == null) throw new BadRequestException("Falta contractId.");
        if (dto.getPaymentCurrency() == null) throw new BadRequestException("Falta moneda.");
        if (dto.getAmount() == null || dto.getAmount().signum() <= 0) throw new BadRequestException("Monto inválido.");
        if (dto.getDate() == null) throw new BadRequestException("Falta fecha.");
        if (dto.getConcept() == null) throw new BadRequestException("Falta concepto.");

        if (!contractRepository.existsById(dto.getContractId())) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }

        if (dto.getCommissionId() != null) {
            if (!commissionRepository.existsById(dto.getCommissionId())) {
                throw new EntityNotFoundException("No se ha encontrado la comisión.");
            }
        } else if (dto.getConcept() == PaymentConcept.COMISION) {
            throw new BadRequestException("Comisión requiere commissionId.");
        }

        if (dto.getContractUtilityId() != null) {
            if (!contractUtilityRepository.existsById(dto.getContractUtilityId())) {
                throw new EntityNotFoundException("No se ha encontrado el servicio del contrato.");
            }
        } else if (dto.getConcept() == PaymentConcept.EXTRA) {
            throw new BadRequestException("Extra requiere contractUtilityId.");
        }
    }

    private void validateConceptRules(PaymentDTO dto, Payment entity) {
        if (dto.getContractId() == null) {
            throw new BadRequestException("Falta contractId.");
        }

        switch (entity.getConcept()) {
            case ALQUILER -> {
                if (entity.getContractUtility() != null)
                    throw new BadRequestException("Alquiler no debe vincularse a un servicio.");
                if (entity.getCommission() != null)
                    throw new BadRequestException("Alquiler no debe vincularse a una comisión.");
            }
            case EXTRA -> {
                if (entity.getContractUtility() == null && dto.getContractUtilityId() == null)
                    throw new BadRequestException("Extra requiere contractUtilityId.");
                if (entity.getCommission() != null)
                    throw new BadRequestException("Extra no debe vincularse a una comisión.");

                if (entity.getContractUtility() != null && !entity.getContractUtility().getContract().getId().equals(dto.getContractId())) {
                    throw new BadRequestException("El servicio no pertenece al contrato indicado.");
                }
            }
            case COMISION -> {
                if (entity.getCommission() == null && dto.getCommissionId() == null)
                    throw new BadRequestException("Comision requiere commissionId.");
                if (entity.getContractUtility() != null)
                    throw new BadRequestException("Comision no debe vincularse a un servicio.");

                if (entity.getCommission() != null && !entity.getCommission().getContract().getId().equals(dto.getContractId())) {
                    throw new BadRequestException("La comisión no pertenece al contrato indicado.");
                }
            }
        }
    }

    private void validateRange(LocalDateTime from, LocalDateTime to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new BadRequestException("Rango de fechas inválido.");
        }
    }

    @Override
    @Transactional
    public ResponseEntity<String> create(PaymentDTO dto) {
        if (dto.getId() != null) throw new BadRequestException("El id debe ser null al crear.");

        simpleValid(dto);

        Payment entity = toEntity(dto);

        validateConceptRules(dto, entity);

        paymentRepository.save(entity);

        return ResponseEntity.ok("Se ha creado el pago.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> update(PaymentDTO dto) {
        if (dto.getId() == null) throw new BadRequestException("Falta el id del pago.");
        if (!paymentRepository.existsById(dto.getId())) {
            throw new EntityNotFoundException("No se ha encontrado el pago.");
        }

        simpleValid(dto);

        Payment entity = toEntity(dto);

        validateConceptRules(dto, entity);

        paymentRepository.save(entity);

        return ResponseEntity.ok("Se ha actualizado el pago.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> delete(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new EntityNotFoundException("No se ha encontrado el pago.");
        }
        paymentRepository.deleteById(id);
        return ResponseEntity.ok("Se ha eliminado el pago.");
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<PaymentDTO> getById(Long id) {
        Optional<Payment> payment = paymentRepository.findById(id);
        if (payment.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el pago.");
        }
        PaymentDTO paymentDTO = toDTO(payment.get());
        return ResponseEntity.ok(paymentDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentDTO>> getByContract(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        List<Payment> payments = paymentRepository.findByContractId(contractId);
        List<PaymentDTO> paymentDTOS = payments.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(paymentDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentDTO>> getByContractUtility(Long contractUtilityId) {
        if (!contractUtilityRepository.existsById(contractUtilityId)) {
            throw new EntityNotFoundException("No se ha encontrado el servicio del contrato.");
        }
        List<Payment> payments = paymentRepository.findByContractUtilityId(contractUtilityId);
        List<PaymentDTO> paymentDTOS = payments.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(paymentDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentDTO>> getByCommission(Long commissionId) {
        if (!commissionRepository.existsById(commissionId)) {
            throw new EntityNotFoundException("No se ha encontrado la comision.");
        }
        List<Payment> payments = paymentRepository.findByCommissionId(commissionId);
        List<PaymentDTO> paymentDTOS = payments.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(paymentDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<PaymentDTO> getLastByContract(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        Optional<Payment> payment = paymentRepository.findLastByContractId(contractId);
        if (payment.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el pago.");
        }
        PaymentDTO paymentDTO = toDTO(payment.get());
        return ResponseEntity.ok(paymentDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<PaymentDTO> getLastByContractUtility(Long contractUtilityId) {
        if (!contractUtilityRepository.existsById(contractUtilityId)) {
            throw new EntityNotFoundException("No se ha encontrado el servicio del contrato.");
        }
        Optional<Payment> payment = paymentRepository.findLastByContractUtilityId(contractUtilityId);
        if (payment.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el pago.");
        }
        PaymentDTO paymentDTO = toDTO(payment.get());
        return ResponseEntity.ok(paymentDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<PaymentDTO> getLastByCommission(Long commissionId) {
        if (!commissionRepository.existsById(commissionId)) {
            throw new EntityNotFoundException("No se ha encontrado la comision.");
        }
        Optional<Payment> payment = paymentRepository.findLastByCommissionId(commissionId);
        if (payment.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el pago.");
        }
        PaymentDTO paymentDTO = toDTO(payment.get());
        return ResponseEntity.ok(paymentDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentDTO>> getByDateRange(LocalDateTime from, LocalDateTime to) {
        validateRange(from, to);
        List<Payment> payments = paymentRepository.findByDateRange(from, to);
        List<PaymentDTO> paymentDTOS = payments.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(paymentDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentDTO>> getByDateRangeAndContract(Long contractId, LocalDateTime from, LocalDateTime to) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        validateRange(from, to);
        List<Payment> payments = paymentRepository.findByDateRangeAndContract(contractId, from, to);
        List<PaymentDTO> paymentDTOS = payments.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(paymentDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentDTO>> getByDateRangeAndUtility(Long contractUtilityId, LocalDateTime from, LocalDateTime to) {
        if (!contractUtilityRepository.existsById(contractUtilityId)) {
            throw new EntityNotFoundException("No se ha encontrado el servicio del contrato.");
        }
        validateRange(from, to);
        List<Payment> payments = paymentRepository.findByDateRangeAndContractUtility(contractUtilityId, from, to);
        List<PaymentDTO> paymentDTOS = payments.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(paymentDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentDTO>> getByDateRangeAndCommission(Long commissionId, LocalDateTime from, LocalDateTime to) {
        if (!commissionRepository.existsById(commissionId)) {
            throw new EntityNotFoundException("No se ha encontrado la comision.");
        }
        validateRange(from, to);
        List<Payment> payments = paymentRepository.findByDateRangeAndCommission(commissionId, from, to);
        List<PaymentDTO> paymentDTOS = payments.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(paymentDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentDTO>> getByConcept(PaymentConcept concept) {
        List<Payment> payments = paymentRepository.findByConcept(concept);
        List<PaymentDTO> paymentDTOS = payments.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(paymentDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<PaymentDTO>> getByCurrency(PaymentCurrency currency) {
        List<Payment> payments = paymentRepository.findByCurrency(currency);
        List<PaymentDTO> paymentDTOS = payments.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(paymentDTOS);
    }
}
