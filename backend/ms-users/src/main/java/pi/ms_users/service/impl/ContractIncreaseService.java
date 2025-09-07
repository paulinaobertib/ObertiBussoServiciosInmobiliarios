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
import pi.ms_users.domain.ContractIncrease;
import pi.ms_users.domain.IncreaseIndex;
import pi.ms_users.domain.User;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.dto.email.EmailContractIncreaseLoadedDTO;
import pi.ms_users.repository.IContractIncreaseRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IIncreaseIndexRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.interf.IContractIncreaseService;
import pi.ms_users.service.interf.IEmailService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ContractIncreaseService implements IContractIncreaseService {

    public final IContractIncreaseRepository contractIncreaseRepository;

    public final IContractRepository contractRepository;

    public final IIncreaseIndexRepository increaseIndexRepository;

    private final IUserRepository userRepository;

    private final IEmailService emailService;

    @PersistenceContext
    private EntityManager em;

    public ContractIncreaseDTO toDTO(ContractIncrease entity) {
        if (entity == null) return null;

        ContractIncreaseDTO dto = new ContractIncreaseDTO();
        dto.setId(entity.getId());
        dto.setDate(entity.getDate());
        dto.setCurrency(entity.getCurrency());
        dto.setAmount(entity.getAmount());
        dto.setAdjustment(entity.getAdjustment());
        dto.setNote(entity.getNote());
        dto.setPeriodFrom(entity.getPeriodFrom());
        dto.setPeriodTo(entity.getPeriodTo());
        dto.setContractId(entity.getContract() != null ? entity.getContract().getId() : null);
        dto.setIndexId(entity.getIndex() != null ? entity.getIndex().getId() : null);
        return dto;
    }

    public ContractIncrease toEntity(ContractIncreaseDTO dto) {
        if (dto == null) return null;

        ContractIncrease entity = new ContractIncrease();
        entity.setId(dto.getId());
        entity.setDate(dto.getDate());
        entity.setCurrency(dto.getCurrency());
        entity.setAmount(dto.getAmount());
        entity.setAdjustment(dto.getAdjustment());
        entity.setNote(dto.getNote());
        entity.setPeriodFrom(dto.getPeriodFrom());
        entity.setPeriodTo(dto.getPeriodTo());

        if (dto.getContractId() != null) {
            entity.setContract(em.getReference(Contract.class, dto.getContractId()));
        } else {
            entity.setContract(null);
        }

        if (dto.getIndexId() != null) {
            entity.setIndex(em.getReference(IncreaseIndex.class, dto.getIndexId()));
        } else {
            entity.setIndex(null);
        }

        return entity;
    }

    private void validateDtoBusiness(ContractIncreaseDTO dto) {
        if (dto.getAmount() != null && dto.getAmount().signum() < 0) {
            throw new BadRequestException("El monto no puede ser negativo.");
        }
        if (dto.getAdjustment() != null && dto.getAdjustment() < 0) {
            throw new BadRequestException("El ajuste no puede ser negativo.");
        }
        if (dto.getPeriodFrom() != null && dto.getPeriodTo() != null &&
                dto.getPeriodFrom().isAfter(dto.getPeriodTo())) {
            throw new BadRequestException("periodFrom no puede ser posterior a periodTo.");
        }
    }

    @Override
    @Transactional
    public ResponseEntity<String> create(ContractIncreaseDTO contractIncreaseDTO) {
        if (contractIncreaseDTO.getId() != null) {
            throw new BadRequestException("El id debe ser null al crear un incremento.");
        }

        validateDtoBusiness(contractIncreaseDTO);

        if (!increaseIndexRepository.existsById(contractIncreaseDTO.getIndexId())) {
            throw new EntityNotFoundException("No se ha encontrado el indice de aumento.");
        }

        Optional<Contract> contract = contractRepository.findById(contractIncreaseDTO.getContractId());
        if (contract.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }

        ContractIncrease contractIncrease = toEntity(contractIncreaseDTO);
        contractIncreaseRepository.save(contractIncrease);

        User user = userRepository.findById(contract.get().getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario."));

        EmailContractIncreaseLoadedDTO emailContractIncreaseLoadedDTO = new EmailContractIncreaseLoadedDTO();
        emailContractIncreaseLoadedDTO.setTo(user.getEmail());
        emailContractIncreaseLoadedDTO.setFirstName(user.getFirstName());
        emailContractIncreaseLoadedDTO.setLastName(user.getLastName());
        emailContractIncreaseLoadedDTO.setNewAmount(contractIncrease.getAmount());
        emailContractIncreaseLoadedDTO.setCurrency(contractIncrease.getCurrency().toString());
        emailContractIncreaseLoadedDTO.setIncrease(contractIncrease.getAdjustment());
        emailContractIncreaseLoadedDTO.setIndex(contractIncrease.getIndex().getName());
        emailService.sendContractIncreaseLoadedEmail(emailContractIncreaseLoadedDTO, contract.get().getId());

        return ResponseEntity.ok("Se ha guardado el incremento del contrato.");
    }

    @Transactional
    @Override
    public ResponseEntity<String> update(ContractIncreaseDTO dto) {
        if (dto.getId() == null) {
            throw new BadRequestException("Falta el id del incremento a actualizar.");
        }

        validateDtoBusiness(dto);

        ContractIncrease entity = contractIncreaseRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el incremento que se quiere actualizar."));

        Optional<Contract> contract = contractRepository.findById(entity.getContract().getId());
        if (contract.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }

        User user = userRepository.findById(contract.get().getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario."));

        if (dto.getDate() != null)        entity.setDate(dto.getDate());
        if (dto.getCurrency() != null)    entity.setCurrency(dto.getCurrency());
        if (dto.getAmount() != null)      entity.setAmount(dto.getAmount());
        if (dto.getAdjustment() != null)  entity.setAdjustment(dto.getAdjustment());
        if (dto.getNote() != null)        entity.setNote(dto.getNote());
        if (dto.getPeriodFrom() != null)  entity.setPeriodFrom(dto.getPeriodFrom());
        if (dto.getPeriodTo() != null)    entity.setPeriodTo(dto.getPeriodTo());

        if (dto.getContractId() != null &&
                (entity.getContract() == null || !entity.getContract().getId().equals(dto.getContractId()))) {
            entity.setContract(em.getReference(Contract.class, dto.getContractId()));
        }

        if (dto.getIndexId() != null && (entity.getIndex() == null || !entity.getIndex().getId().equals(dto.getIndexId()))) {
            entity.setIndex(em.getReference(IncreaseIndex.class, dto.getIndexId()));
        }

        contractIncreaseRepository.save(entity);

        EmailContractIncreaseLoadedDTO emailContractIncreaseLoadedDTO = new EmailContractIncreaseLoadedDTO();
        emailContractIncreaseLoadedDTO.setTo(user.getEmail());
        emailContractIncreaseLoadedDTO.setFirstName(user.getFirstName());
        emailContractIncreaseLoadedDTO.setLastName(user.getLastName());
        emailContractIncreaseLoadedDTO.setNewAmount(entity.getAmount());
        emailContractIncreaseLoadedDTO.setCurrency(entity.getCurrency().toString());
        emailContractIncreaseLoadedDTO.setIncrease(entity.getAdjustment());
        emailContractIncreaseLoadedDTO.setIndex(entity.getIndex().getName());
        emailService.sendContractIncreaseLoadedEmailUpdate(emailContractIncreaseLoadedDTO, contract.get().getId());

        return ResponseEntity.ok("Se ha actualizado el incremento.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> delete(Long id) {
        if (!contractIncreaseRepository.existsById(id)) {
            throw new EntityNotFoundException("No se ha encontrado el incremento que se quiere eliminar.");
        }
        contractIncreaseRepository.deleteById(id);
        return ResponseEntity.ok("Se ha eliminado el incremento.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> deleteByContractId(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        contractIncreaseRepository.deleteByContractId(contractId);
        return ResponseEntity.ok("Se han eliminado los incrementos vinculados al contrato.");
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<ContractIncreaseDTO> getById(Long id) {
        Optional<ContractIncrease> contractIncrease = contractIncreaseRepository.findById(id);
        if (contractIncrease.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el incremento.");
        }
        ContractIncreaseDTO contractIncreaseDTO = toDTO(contractIncrease.get());
        return ResponseEntity.ok(contractIncreaseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractIncreaseDTO>> getByContractId(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        List<ContractIncrease> contractIncreases = contractIncreaseRepository.findByContractId(contractId);
        List<ContractIncreaseDTO> contractIncreaseDTOS = contractIncreases.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(contractIncreaseDTOS);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<ContractIncreaseDTO> getLastByContractId(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
        Optional<ContractIncrease> contractIncrease = contractIncreaseRepository.findLastByContractId(contractId);
        if (contractIncrease.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado ningun incremento vinculado al contrato.");
        }
        ContractIncreaseDTO contractIncreaseDTO = toDTO(contractIncrease.get());
        return ResponseEntity.ok(contractIncreaseDTO);
    }
}