package pi.ms_users.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractUtility;
import pi.ms_users.domain.Utility;
import pi.ms_users.domain.UtilityPeriodicityPayment;
import pi.ms_users.dto.ContractUtilityDTO;
import pi.ms_users.dto.ContractUtilityGetDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IContractUtilityRepository;
import pi.ms_users.repository.IUtilityRepository;
import pi.ms_users.service.interf.IContractUtilityService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ContractUtilityService implements IContractUtilityService {

    private final IContractUtilityRepository contractUtilityRepository;

    private final IContractRepository contractRepository;

    private final IUtilityRepository utilityRepository;

    @PersistenceContext
    private EntityManager em;

    public ContractUtilityGetDTO toGetDTO(ContractUtility entity) {
        if (entity == null) return null;

        ContractUtilityGetDTO dto = new ContractUtilityGetDTO();
        dto.setId(entity.getId());
        dto.setPeriodicity(entity.getPeriodicity());
        dto.setInitialAmount(entity.getInitialAmount());
        dto.setLastPaidAmount(entity.getLastPaidAmount());
        dto.setLastPaidDate(entity.getLastPaidDate());
        dto.setNotes(entity.getNotes());
        dto.setContractId(entity.getContract() != null ? entity.getContract().getId() : null);
        dto.setUtilityId(entity.getUtility() != null ? entity.getUtility().getId() : null);
        dto.setPaymentList(entity.getPayments());

        return dto;
    }

    public ContractUtility toEntity(ContractUtilityDTO dto) {
        if (dto == null) return null;

        ContractUtility entity = new ContractUtility();
        entity.setId(dto.getId());
        entity.setPeriodicity(dto.getPeriodicity());
        entity.setInitialAmount(dto.getInitialAmount());
        entity.setLastPaidAmount(dto.getLastPaidAmount());
        entity.setLastPaidDate(dto.getLastPaidDate());
        entity.setNotes(dto.getNotes());

        if (dto.getContractId() != null) {
            entity.setContract(em.getReference(Contract.class, dto.getContractId()));
        }
        if (dto.getUtilityId() != null) {
            entity.setUtility(em.getReference(Utility.class, dto.getUtilityId()));
        }

        return entity;
    }

    private void validateBusiness(ContractUtilityDTO dto) {
        if (dto.getInitialAmount() != null && dto.getInitialAmount().signum() < 0)
            throw new BadRequestException("El monto inicial no puede ser negativo.");
        if (dto.getLastPaidAmount() != null && dto.getLastPaidAmount().signum() < 0)
            throw new BadRequestException("El último pago no puede ser negativo.");
    }

    @Override
    public ResponseEntity<String> create(ContractUtilityDTO contractUtilityDTO) {
        if (contractUtilityDTO.getContractId() == null) throw new BadRequestException("Falta contractId.");
        if (contractUtilityDTO.getUtilityId() == null)  throw new BadRequestException("Falta utilityId.");

        if (contractUtilityDTO.getId() != null) throw new BadRequestException("El id debe ser null al crear.");

        if (!contractRepository.existsById(contractUtilityDTO.getContractId())) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }

        if (!utilityRepository.existsById(contractUtilityDTO.getUtilityId())) {
            throw new EntityNotFoundException("No se ha encontrado el servicio.");
        }

        validateBusiness(contractUtilityDTO);

        ContractUtility contractUtility = toEntity(contractUtilityDTO);
        contractUtilityRepository.save(contractUtility);

        return ResponseEntity.ok("Se ha guardado el servicio del contrato.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> update(ContractUtilityDTO dto) {
        if (dto.getId() == null) throw new BadRequestException("Falta id para actualizar.");

        ContractUtility entity = contractUtilityRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el servicio del contrato."));

        validateBusiness(dto);

        if (dto.getPeriodicity() != null)   entity.setPeriodicity(dto.getPeriodicity());
        if (dto.getInitialAmount() != null) entity.setInitialAmount(dto.getInitialAmount());
        if (dto.getLastPaidAmount() != null)entity.setLastPaidAmount(dto.getLastPaidAmount());
        if (dto.getLastPaidDate() != null)  entity.setLastPaidDate(dto.getLastPaidDate());
        if (dto.getNotes() != null)         entity.setNotes(dto.getNotes());

        if (dto.getContractId() != null && (entity.getContract() == null || !entity.getContract().getId().equals(dto.getContractId()))) {
            if (!contractRepository.existsById(dto.getContractId()))
                throw new EntityNotFoundException("No se ha encontrado el contrato.");
            entity.setContract(em.getReference(Contract.class, dto.getContractId()));
        }
        if (dto.getUtilityId() != null && (entity.getUtility() == null || !entity.getUtility().getId().equals(dto.getUtilityId()))) {
            if (!utilityRepository.existsById(dto.getUtilityId()))
                throw new EntityNotFoundException("No se ha encontrado el servicio.");
            entity.setUtility(em.getReference(Utility.class, dto.getUtilityId()));
        }

        contractUtilityRepository.save(entity);
        return ResponseEntity.ok("Se ha actualizado el servicio del contrato.");
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        if (!contractUtilityRepository.existsById(id)) {
            throw new EntityNotFoundException("No se ha encontrado el servicio del contrato.");
        }
        contractUtilityRepository.deleteById(id);
        return ResponseEntity.ok("Se ha eliminado el servicio del contrato.");
    }

    @Override
    public ResponseEntity<String> deleteByContract(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        contractUtilityRepository.deleteByContractId(contractId);
        return ResponseEntity.ok("Se han eliminado los servicios del contrato.");
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<ContractUtilityGetDTO> getById(Long id) {
        Optional<ContractUtility> contractUtility = contractUtilityRepository.findDetailedById(id);
        if (contractUtility.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el servicio del contrato.");
        }
        ContractUtilityGetDTO contractUtilityGetDTO = toGetDTO(contractUtility.get());
        return ResponseEntity.ok(contractUtilityGetDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractUtilityGetDTO>> getByContract(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        List<ContractUtility> contractUtilities = contractUtilityRepository.findDetailedByContractId(contractId);
        List<ContractUtilityGetDTO> contractUtilityGetDTOs = contractUtilities.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractUtilityGetDTOs);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractUtilityGetDTO>> getByUtility(Long utilityId) {
        if (!utilityRepository.existsById(utilityId)) {
            throw new EntityNotFoundException("No se ha encontrado el servicio.");
        }
        List<ContractUtility> contractUtilities = contractUtilityRepository.findDetailedByUtilityId(utilityId);
        List<ContractUtilityGetDTO> contractUtilityGetDTOs = contractUtilities.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractUtilityGetDTOs);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractUtilityGetDTO>> getByPeriodicity(UtilityPeriodicityPayment periodicity) {
        List<ContractUtility> contractUtilities = contractUtilityRepository.findDetailedByPeriodicity(periodicity);
        List<ContractUtilityGetDTO> contractUtilityGetDTOs = contractUtilities.stream().map(this::toGetDTO).toList();
        return ResponseEntity.ok(contractUtilityGetDTOs);
    }
}
