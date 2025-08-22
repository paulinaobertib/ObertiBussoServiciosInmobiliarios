package pi.ms_users.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.*;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.dto.ContractGetDTO;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IIncreaseIndexRepository;
import pi.ms_users.service.interf.IContractService;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {

    private final IContractRepository contractRepository;

    private final IIncreaseIndexRepository increaseIndexRepository;

    @PersistenceContext
    private EntityManager em;

    public ContractGetDTO toGetDTO(Contract entity) {
        if (entity == null) return null;
        ContractGetDTO dto = new ContractGetDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setPropertyId(entity.getPropertyId());
        dto.setContractType(entity.getContractType());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setContractStatus(entity.getContractStatus());
        dto.setCurrency(entity.getCurrency());
        dto.setInitialAmount(entity.getInitialAmount());
        dto.setAdjustmentFrequencyMonths(entity.getAdjustmentFrequencyMonths());
        dto.setLastPaidAmount(entity.getLastPaidAmount());
        dto.setLastPaidDate(entity.getLastPaidDate());
        dto.setNote(entity.getNote());
        dto.setAdjustmentIndex(entity.getAdjustmentIndex());
        dto.setContractUtilities(entity.getContractUtilities());
        dto.setContractIncrease(entity.getContractIncrease());
        dto.setCommission(entity.getCommission());
        dto.setPayments(entity.getPayments());
        return dto;
    }

    public ContractSimpleDTO toSimpleDTO(Contract entity) {
        if (entity == null) return null;
        ContractSimpleDTO dto = new ContractSimpleDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setPropertyId(entity.getPropertyId());
        dto.setContractType(entity.getContractType());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setContractStatus(entity.getContractStatus());
        dto.setCurrency(entity.getCurrency());
        dto.setInitialAmount(entity.getInitialAmount());
        dto.setAdjustmentFrequencyMonths(entity.getAdjustmentFrequencyMonths());
        dto.setLastPaidAmount(entity.getLastPaidAmount());
        dto.setLastPaidDate(entity.getLastPaidDate());
        dto.setNote(entity.getNote());
        dto.setAdjustmentIndexId(entity.getAdjustmentIndex() != null ? entity.getAdjustmentIndex().getId() : null);
        dto.setContractUtilitiesIds(entity.getContractUtilities()
                .stream().map(ContractUtility::getId).collect(Collectors.toList()));
        dto.setCommissionId(entity.getCommission() != null ? entity.getCommission().getId() : null);
        dto.setPaymentsIds(entity.getPayments()
                .stream().map(Payment::getId).collect(Collectors.toList()));
        return dto;
    }

    public Contract toEntity(ContractDTO dto) {
        if (dto == null) return null;
        Contract entity = new Contract();
        entity.setId(dto.getId());
        entity.setUserId(dto.getUserId());
        entity.setPropertyId(dto.getPropertyId());
        entity.setContractType(dto.getContractType());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setContractStatus(dto.getContractStatus());
        entity.setCurrency(dto.getCurrency());
        entity.setInitialAmount(dto.getInitialAmount());
        entity.setAdjustmentFrequencyMonths(dto.getAdjustmentFrequencyMonths());
        entity.setLastPaidAmount(dto.getLastPaidAmount());
        entity.setLastPaidDate(dto.getLastPaidDate());
        entity.setNote(dto.getNote());

        if (dto.getAdjustmentIndexId() != null) {
            entity.setAdjustmentIndex(em.getReference(IncreaseIndex.class, dto.getAdjustmentIndexId()));
        }

        return entity;
    }

    @Override
    @Transactional
    public ResponseEntity<String> create(ContractDTO contractDTO) {
        if (contractDTO.getAdjustmentIndexId() == null || !increaseIndexRepository.existsById(contractDTO.getAdjustmentIndexId())) {
            throw new EntityNotFoundException("No se ha encontrado el índice de aumento con ID: " + contractDTO.getAdjustmentIndexId());
        }

        Contract entity = toEntity(contractDTO);

        contractRepository.save(entity);

        return ResponseEntity.ok("Se ha creado el contrato.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> update(ContractDTO contractDTO) {
        if (contractDTO.getId() == null) {
            throw new IllegalArgumentException("Debe indicar el ID del contrato a actualizar.");
        }

        Contract entity = contractRepository.findById(contractDTO.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato con ID: " + contractDTO.getId()));

        if (contractDTO.getAdjustmentIndexId() != null &&
                !increaseIndexRepository.existsById(contractDTO.getAdjustmentIndexId())) {
            throw new EntityNotFoundException(
                    "No se ha encontrado el índice de aumento con ID: " + contractDTO.getAdjustmentIndexId()
            );
        }

        if (contractDTO.getUserId() != null) entity.setUserId(contractDTO.getUserId());
        if (contractDTO.getPropertyId() != null) entity.setPropertyId(contractDTO.getPropertyId());
        if (contractDTO.getContractType() != null) entity.setContractType(contractDTO.getContractType());
        if (contractDTO.getStartDate() != null) entity.setStartDate(contractDTO.getStartDate());
        if (contractDTO.getEndDate() != null) entity.setEndDate(contractDTO.getEndDate());
        if (contractDTO.getContractStatus() != null) entity.setContractStatus(contractDTO.getContractStatus());
        if (contractDTO.getCurrency() != null) entity.setCurrency(contractDTO.getCurrency());
        if (contractDTO.getInitialAmount() != null) entity.setInitialAmount(contractDTO.getInitialAmount());
        if (contractDTO.getAdjustmentFrequencyMonths() != null)
            entity.setAdjustmentFrequencyMonths(contractDTO.getAdjustmentFrequencyMonths());
        if (contractDTO.getLastPaidAmount() != null) entity.setLastPaidAmount(contractDTO.getLastPaidAmount());
        if (contractDTO.getLastPaidDate() != null) entity.setLastPaidDate(contractDTO.getLastPaidDate());
        if (contractDTO.getNote() != null) entity.setNote(contractDTO.getNote());

        if (contractDTO.getAdjustmentIndexId() != null) {
            entity.setAdjustmentIndex(em.getReference(IncreaseIndex.class, contractDTO.getAdjustmentIndexId()));
        }

        contractRepository.save(entity);

        return ResponseEntity.ok("Se ha actualizado el contrato.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> updateStatus(Long contractId) {
        Contract entity = contractRepository.findById(contractId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato."));

        ContractStatus status = entity.getContractStatus();

        if (status == ContractStatus.ACTIVO) {
            entity.setContractStatus(ContractStatus.INACTIVO);
        } else {
            entity.setContractStatus(ContractStatus.ACTIVO);
        }

        return ResponseEntity.ok("Se ha actualizado el estado del contrato.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> delete(Long id) {
        if (!contractRepository.existsById(id)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }

        contractRepository.deleteById(id);
        return ResponseEntity.ok("Se ha eliminado el contrato.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> deleteByPropertyId(Long propertyId) {
        contractRepository.deleteByPropertyId(propertyId);
        return ResponseEntity.ok("Se ha eliminado el contrato.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> deleteByUserId(String userId) {
        contractRepository.deleteByUserId(userId);
        return ResponseEntity.ok("Se ha eliminado el contrato.");
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<ContractGetDTO> getById(Long id) {
        Contract entity = contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato."));

        ContractGetDTO contractGetDTO = toGetDTO(entity);

        return ResponseEntity.ok(contractGetDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getAll() {
        List<Contract> contracts = contractRepository.findAll();
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getByUserId(String userId) {
        List<Contract> contracts = contractRepository.findByUserId(userId);
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getByStatus(ContractStatus status) {
        List<Contract> contracts = contractRepository.findByStatus(status);
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getByType(ContractType type) {
        List<Contract> contracts = contractRepository.findByType(type);
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getActiveContracts() {
        List<Contract> contracts = contractRepository.findActiveContracts();
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getByProperty(Long propertyId) {
        List<Contract> contracts = contractRepository.findByProperty(propertyId);
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractSimpleDTO>> getByPropertyForMS(Long propertyId) {
        List<Contract> contracts = contractRepository.findByPropertyMS(propertyId);
        List<ContractSimpleDTO> contractSimpleDTOS = contracts.stream().map(this::toSimpleDTO).toList();
        return ResponseEntity.ok(contractSimpleDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getByDate(LocalDate date) {
        List<Contract> contracts = contractRepository.findByDate(date);
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getByDateRange(LocalDate from, LocalDate to) {
        List<Contract> contracts = contractRepository.findByDateRange(from, to);
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getContractsExpiringWithin(int days) {
        LocalDate to = LocalDate.now().plusDays(days);
        List<Contract> contracts = contractRepository.findExpiringUntil(to);
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getContractsEndingDate(LocalDate date) {
        List<Contract> contracts = contractRepository.findByExactEndDate(date);
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGetDTO>> getContractsEndingBetween(LocalDate from, LocalDate to) {
        List<Contract> contracts = contractRepository.findExpiringBetween(from, to);
        List<ContractGetDTO> contractGetDTOS = contracts.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractGetDTOS);
    }
}
