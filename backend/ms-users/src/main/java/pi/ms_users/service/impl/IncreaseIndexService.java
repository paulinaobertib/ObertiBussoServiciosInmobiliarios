package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.IncreaseIndex;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IIncreaseIndexRepository;
import pi.ms_users.service.interf.IIncreaseIndexService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncreaseIndexService implements IIncreaseIndexService {

    private final IIncreaseIndexRepository increaseIndexRepository;

    private final IContractRepository contractRepository;

    public ContractSimpleDTO mapToDTO(Contract contract) {
        if (contract == null) {
            return null;
        }
        ContractSimpleDTO dto = new ContractSimpleDTO();
        dto.setId(contract.getId());
        dto.setUserId(contract.getUserId());
        dto.setPropertyId(contract.getPropertyId());
        dto.setContractType(contract.getContractType());
        dto.setStartDate(contract.getStartDate());
        dto.setEndDate(contract.getEndDate());
        dto.setContractStatus(contract.getContractStatus());
        dto.setCurrency(contract.getCurrency());
        dto.setInitialAmount(contract.getInitialAmount());
        dto.setAdjustmentFrequencyMonths(contract.getAdjustmentFrequencyMonths());
        dto.setLastPaidAmount(contract.getLastPaidAmount());
        dto.setLastPaidDate(contract.getLastPaidDate());
        dto.setNote(contract.getNote());
        return dto;
    }

    @Override
    @Transactional
    public ResponseEntity<String> create(IncreaseIndex increaseIndex) {
        increaseIndexRepository.findByCode(increaseIndex.getCode()).ifPresent(x -> {
            throw new IllegalArgumentException("Ya existe un índice con ese código.");
        });

        increaseIndexRepository.save(increaseIndex);
        return ResponseEntity.ok("Se ha creado el indice de aumento.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> update(IncreaseIndex increaseIndex) {
        IncreaseIndex found = increaseIndexRepository.findById(increaseIndex.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el indice de aumento."));
        found.setCode(increaseIndex.getCode());
        found.setName(increaseIndex.getName());
        increaseIndexRepository.save(found);
        return ResponseEntity.ok("Se ha actualizado el indice de aumento.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> delete(Long id) {
        IncreaseIndex found = increaseIndexRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el indice de aumento."));

        boolean inUse = increaseIndexRepository.existsByAdjustmentIndexId(id);
        if (inUse) {
            return ResponseEntity.badRequest()
                    .body("No se pueden eliminar los índices que tienen contratos vinculados.");
        }

        increaseIndexRepository.delete(found);
        return ResponseEntity.ok("Se ha eliminado el indice de aumento.");
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<IncreaseIndex> getById(Long id) {
        IncreaseIndex found = increaseIndexRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el indice de aumento."));
        return ResponseEntity.ok(found);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<IncreaseIndex>> getAll() {
        List<IncreaseIndex> increaseIndices = increaseIndexRepository.findAll();
        return ResponseEntity.ok(increaseIndices);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<IncreaseIndex> getByName(String name) {
        IncreaseIndex found = increaseIndexRepository.findByName(name)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el indice de aumento."));
        return ResponseEntity.ok(found);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<IncreaseIndex> getByCode(String code) {
        IncreaseIndex found = increaseIndexRepository.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el indice de aumento."));
        return ResponseEntity.ok(found);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<ContractSimpleDTO>> getContractsByIncreaseIndex(Long id) {
        List<Contract> contracts = increaseIndexRepository.findContractsByIncreaseIndexId(id);
        List<ContractSimpleDTO> contractSimpleDTOS = contracts.stream().map(this::mapToDTO).toList();
        return ResponseEntity.ok(contractSimpleDTOS);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<IncreaseIndex> getByContract(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        IncreaseIndex increaseIndex = increaseIndexRepository.findByContractId(contractId);
        return ResponseEntity.ok(increaseIndex);
    }
}