package pi.ms_users.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.*;
import pi.ms_users.dto.CommissionDTO;
import pi.ms_users.dto.CommissionGetDTO;
import pi.ms_users.repository.ICommissionRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.service.interf.ICommissionService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CommissionService implements ICommissionService {

    private final ICommissionRepository commissionRepository;

    private final IContractRepository contractRepository;

    @PersistenceContext
    private EntityManager em;

    public CommissionGetDTO toGetDTO(Commission entity) {
        if (entity == null) return null;

        CommissionGetDTO dto = new CommissionGetDTO();
        dto.setId(entity.getId());
        dto.setCurrency(entity.getCurrency());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setDate(entity.getDate());
        dto.setPaymentType(entity.getPaymentType());
        dto.setInstallments(entity.getInstallments());
        dto.setStatus(entity.getStatus());
        dto.setNote(entity.getNote());
        dto.setContractId(entity.getContract() != null ? entity.getContract().getId() : null);
        dto.setPayments(entity.getPayments() != null ? new ArrayList<>(entity.getPayments()) : List.of());
        return dto;
    }

    public Commission toEntity(CommissionDTO dto) {
        if (dto == null) return null;

        Commission entity = new Commission();
        entity.setId(dto.getId());
        entity.setCurrency(dto.getCurrency());
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setDate(dto.getDate());
        entity.setPaymentType(dto.getPaymentType());
        entity.setInstallments(dto.getInstallments());
        entity.setStatus(dto.getStatus());
        entity.setNote(dto.getNote());

        if (dto.getContractId() != null) {
            entity.setContract(em.getReference(Contract.class, dto.getContractId()));
        }
        return entity;
    }

    @Override
    public ResponseEntity<String> create(CommissionDTO commissionDTO) {
        if (!contractRepository.existsById(commissionDTO.getContractId())) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        Commission commission = toEntity(commissionDTO);
        commissionRepository.save(commission);
        return ResponseEntity.ok("Se ha creado la comision.");
    }

    @Override
    public ResponseEntity<String> update(CommissionDTO commissionDTO) {
        if (!contractRepository.existsById(commissionDTO.getContractId())) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }

        if(!commissionRepository.existsById(commissionDTO.getId())) {
            throw new EntityNotFoundException("No se ha encontrado la comision.");
        }

        Commission commission = toEntity(commissionDTO);
        commissionRepository.save(commission);
        return ResponseEntity.ok("Se ha actualizado la comision.");
    }

    @Override
    public ResponseEntity<String> updateStatus(Long id, CommissionStatus status) {
        Optional<Commission> commission = commissionRepository.findById(id);
        if (commission.isEmpty()) {
            return ResponseEntity.badRequest().body("No se ha encontrado la comision.");
        }
        commission.get().setStatus(status);
        commissionRepository.save(commission.get());
        return ResponseEntity.ok("Se ha actualizado el estado de la comision.");
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        Optional<Commission> commission = commissionRepository.findById(id);
        if (commission.isEmpty()) {
            return ResponseEntity.badRequest().body("No se ha encontrado la comision.");
        }
        commissionRepository.delete(commission.get());
        return ResponseEntity.ok("Se ha eliminado la comision.");
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<CommissionGetDTO> getById(Long id) {
        Optional<Commission> commission = commissionRepository.findById(id);
        if (commission.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado la comision.");
        }
        CommissionGetDTO commissionGetDTO = toGetDTO(commission.get());
        return ResponseEntity.ok(commissionGetDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<CommissionGetDTO>> getAll() {
        List<Commission> commissions = commissionRepository.findAll();
        List<CommissionGetDTO> commissionGetDTOS = commissions.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(commissionGetDTOS);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<CommissionGetDTO> getByContractId(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        Commission commission = commissionRepository.findByContract_IdOrderByDateDescIdDesc(contractId);
        CommissionGetDTO commissionGetDTO = toGetDTO(commission);
        return ResponseEntity.ok(commissionGetDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<CommissionGetDTO>> getByDate(LocalDate date) {
        List<Commission> commissions = commissionRepository.findByDate(date);
        List<CommissionGetDTO> commissionGetDTOS = commissions.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(commissionGetDTOS);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<CommissionGetDTO>> getByDateRange(LocalDate from, LocalDate to) {
        List<Commission> commissions = commissionRepository.findByDateBetween(from, to);
        List<CommissionGetDTO> commissionGetDTOS = commissions.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(commissionGetDTOS);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<CommissionGetDTO>> getByInstallments(Integer installments) {
        List<Commission> commissions = commissionRepository.findByInstallments(installments);
        List<CommissionGetDTO> commissionGetDTOS = commissions.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(commissionGetDTOS);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<CommissionGetDTO>> getByStatus(CommissionStatus status) {
        List<Commission> commissions = commissionRepository.findByStatus(status);
        List<CommissionGetDTO> commissionGetDTOS = commissions.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(commissionGetDTOS);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<CommissionGetDTO>> getByPaymentType(CommissionPaymentType paymentType) {
        List<Commission> commissions = commissionRepository.findByPaymentType(paymentType);
        List<CommissionGetDTO> commissionGetDTOS = commissions.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(commissionGetDTOS);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<BigDecimal> getTotalAmountByStatus(CommissionStatus status, PaymentCurrency currency) {
        if (status == null || !EnumSet.allOf(CommissionStatus.class).contains(status)) {
            throw new IllegalArgumentException("Estado inválido de comisión: " + status);
        }
        if (currency == null) {
            throw new IllegalArgumentException("El tipo de moneda no puede ser nulo.");
        }
        BigDecimal total = commissionRepository.sumTotalAmountByStatusAndCurrency(status, currency);
        return ResponseEntity.ok(total);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<BigDecimal> getDateTotals(LocalDate from, LocalDate to, PaymentCurrency currency) {
        if (currency == null) throw new IllegalArgumentException("El tipo de moneda no puede ser nulo.");
        if (from == null || to == null) throw new IllegalArgumentException("Las fechas 'from' y 'to' no pueden ser nulas.");
        if (from.isAfter(to)) throw new IllegalArgumentException("La fecha 'from' no puede ser posterior a 'to'.");
        BigDecimal total = commissionRepository.sumTotalAmountByDateRangeAndCurrency(from, to, currency);
        return ResponseEntity.ok(total);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<Map<YearMonth, BigDecimal>> getYearMonthlyTotals(int year, PaymentCurrency currency) {
        if (currency == null) throw new IllegalArgumentException("El tipo de moneda no puede ser nulo.");
        if (year < 1970 || year > 3000) throw new IllegalArgumentException("Año inválido: " + year);

        List<Object[]> rows = commissionRepository.sumMonthlyTotalsByYearAndCurrency(year, currency);

        Map<YearMonth, BigDecimal> totals = new LinkedHashMap<>();
        for (Object[] r : rows) {
            Integer yr = ((Number) r[0]).intValue();
            Integer mn = ((Number) r[1]).intValue();
            BigDecimal total = (BigDecimal) r[2];
            totals.put(YearMonth.of(yr, mn), total);
        }

        return ResponseEntity.ok(totals);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<Map<CommissionStatus, Long>> countByStatus() {
        List<Object[]> rows = commissionRepository.countGroupedByStatus();

        Map<CommissionStatus, Long> result = new EnumMap<>(CommissionStatus.class);
        for (Object[] row : rows) {
            CommissionStatus status = (CommissionStatus) row[0];
            Long count = (row[1] instanceof Number) ? ((Number) row[1]).longValue() : 0L;
            result.put(status, count);
        }

        return ResponseEntity.ok(result);
    }
}
