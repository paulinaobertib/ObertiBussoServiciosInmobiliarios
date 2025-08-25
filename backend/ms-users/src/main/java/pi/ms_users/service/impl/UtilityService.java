package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.Utility;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.UtilityDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IUtilityRepository;
import pi.ms_users.service.interf.IUtilityService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilityService implements IUtilityService {

    private final IUtilityRepository utilityRepository;

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
    public ResponseEntity<String> create(UtilityDTO utilityDTO) {
        utilityRepository.findByName(utilityDTO.getName()).ifPresent(x -> {
            throw new IllegalArgumentException("Ya existe un servicio con ese nombre.");
        });

        Utility utility = new Utility();
        utility.setName(utilityDTO.getName());
        utilityRepository.save(utility);
        return ResponseEntity.ok("Se ha creado el servicio.");
    }

    @Override
    public ResponseEntity<String> update(UtilityDTO utilityDTO) {
        Utility utility = utilityRepository.findById(utilityDTO.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el servicio."));
        utility.setName(utilityDTO.getName());
        utilityRepository.save(utility);
        return ResponseEntity.ok("Se ha actualizado el servicio.");
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        Utility utility = utilityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el servicio."));

        boolean inUse = utilityRepository.existsByUtilitiesId(id);
        if (inUse) {
            return ResponseEntity.badRequest().body("No se pueden eliminar los servicios que tienen contratos vinculados.");
        }

        utilityRepository.delete(utility);
        return ResponseEntity.ok("Se ha eliminado el servicio.");
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<UtilityDTO> getById(Long id) {
        Utility utility = utilityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el servicio."));
        UtilityDTO utilityDTO = new UtilityDTO();
        utilityDTO.setId(utility.getId());
        utilityDTO.setName(utility.getName());
        return ResponseEntity.ok(utilityDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<UtilityDTO>> getAll() {
        List<Utility> utilities = utilityRepository.findAll();
        List<UtilityDTO> utilityDTOS = utilities.stream().map(utility -> {
            UtilityDTO utilityDTO = new UtilityDTO();
            utilityDTO.setId(utility.getId());
            utilityDTO.setName(utility.getName());
            return utilityDTO;
        }).toList();
        return ResponseEntity.ok(utilityDTOS);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<UtilityDTO> getByName(String name) {
        Utility utility = utilityRepository.findByName(name)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el servicio."));
        UtilityDTO utilityDTO = new UtilityDTO();
        utilityDTO.setId(utility.getId());
        utilityDTO.setName(utility.getName());
        return ResponseEntity.ok(utilityDTO);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<ContractSimpleDTO>> getContractsByUtility(Long id) {
        Utility utility = utilityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el servicio."));
        List<Contract> contracts = utilityRepository.findAllContractsByUtilityId(utility.getId());
        List<ContractSimpleDTO> contractSimpleDTOS = contracts.stream().map(this::mapToDTO).toList();
        return ResponseEntity.ok(contractSimpleDTOS);
    }

    @Transactional(readOnly = true)
    @Override
    public ResponseEntity<List<UtilityDTO>> getByContract(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        List<Utility> utilities = utilityRepository.findAllByContractId(contractId);
        List<UtilityDTO> utilityDTOS = utilities.stream().map(utility -> {
            UtilityDTO utilityDTO = new UtilityDTO();
            utilityDTO.setId(utility.getId());
            utilityDTO.setName(utility.getName());
            return utilityDTO;
        }).toList();
        return ResponseEntity.ok(utilityDTOS);
    }
}
