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
import pi.ms_users.domain.ContractUtilityIncrease;
import pi.ms_users.domain.User;
import pi.ms_users.dto.ContractUtilityIncreaseDTO;
import pi.ms_users.dto.ContractUtilityIncreaseGetDTO;
import pi.ms_users.dto.email.EmailUtilityAmountLoadedDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IContractUtilityIncreaseRepository;
import pi.ms_users.repository.IContractUtilityRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.interf.IContractUtilityIncreaseService;
import pi.ms_users.service.interf.IEmailService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractUtilityIncreaseService implements IContractUtilityIncreaseService {

    private final IContractUtilityIncreaseRepository contractUtilityIncreaseRepository;

    private final IContractUtilityRepository contractUtilityRepository;

    private final IContractRepository contractRepository;

    private final IUserRepository userRepository;

    private final IEmailService emailService;

    @PersistenceContext
    private EntityManager em;

    private ContractUtilityIncreaseGetDTO toGetDTO(ContractUtilityIncrease entity) {
        if (entity == null) return null;
        ContractUtilityIncreaseGetDTO dto = new ContractUtilityIncreaseGetDTO();
        dto.setId(entity.getId());
        dto.setAdjustmentDate(entity.getAdjustmentDate());
        dto.setAmount(entity.getAmount());
        return dto;
    }

    private ContractUtilityIncreaseDTO toDTO(ContractUtilityIncrease entity) {
        if (entity == null) return null;
        ContractUtilityIncreaseDTO dto = new ContractUtilityIncreaseDTO();
        dto.setId(entity.getId());
        dto.setAdjustmentDate(entity.getAdjustmentDate());
        dto.setAmount(entity.getAmount());
        dto.setContractUtilityId(entity.getContractUtility().getId());
        return dto;
    }

    private ContractUtilityIncrease toEntity(ContractUtilityIncreaseDTO dto) {
        if (dto == null) return null;
        ContractUtilityIncrease entity = new ContractUtilityIncrease();
        entity.setId(dto.getId());
        entity.setAdjustmentDate(dto.getAdjustmentDate());
        entity.setAmount(dto.getAmount());
        if (dto.getContractUtilityId() != null) {
            ContractUtility contractUtility = em.getReference(ContractUtility.class, dto.getContractUtilityId());
            entity.setContractUtility(contractUtility);
        }
        return entity;
    }

    @Override
    @Transactional
    public ResponseEntity<String> create(ContractUtilityIncreaseDTO dto) {
        if (dto.getContractUtilityId() == null) {
            throw new BadRequestException("Falta contractUtilityId.");
        }

        ContractUtility contractUtility = contractUtilityRepository.findById(dto.getContractUtilityId())
                .orElseThrow(() -> new BadRequestException("No se encontró el servicio del contrato."));

        ContractUtilityIncrease entity = toEntity(dto);
        contractUtilityIncreaseRepository.save(entity);

        User user = userRepository.findById(contractUtility.getContract().getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario."));

        EmailUtilityAmountLoadedDTO emailUtilityAmountLoadedDTO = new EmailUtilityAmountLoadedDTO();
        emailUtilityAmountLoadedDTO.setTo(user.getEmail());
        emailUtilityAmountLoadedDTO.setFirstName(user.getFirstName());
        emailUtilityAmountLoadedDTO.setLastName(user.getLastName());
        emailUtilityAmountLoadedDTO.setUtilityName(contractUtility.getUtility().getName());
        emailUtilityAmountLoadedDTO.setAmount(entity.getAmount());
        emailService.sendUtilityAmountLoadedEmail(emailUtilityAmountLoadedDTO, contractUtility.getContract().getId());

        return ResponseEntity.ok("Incremento creado correctamente.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> update(ContractUtilityIncreaseDTO dto) {
        if (dto.getId() == null) throw new BadRequestException("Falta id para actualizar.");

        ContractUtilityIncrease entity = contractUtilityIncreaseRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el incremento del servicio."));

        if (dto.getAdjustmentDate() != null) entity.setAdjustmentDate(dto.getAdjustmentDate());
        if (dto.getAmount() != null) entity.setAmount(dto.getAmount());

        contractUtilityIncreaseRepository.save(entity);
        return ResponseEntity.ok("Incremento actualizado correctamente.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> delete(Long id) {
        if (!contractUtilityIncreaseRepository.existsById(id)) {
            throw new EntityNotFoundException("No se encontró el incremento del servicio.");
        }

        contractUtilityIncreaseRepository.deleteById(id);
        return ResponseEntity.ok("Incremento eliminado correctamente.");
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<ContractUtilityIncreaseDTO> getById(Long id) {
        ContractUtilityIncrease entity = contractUtilityIncreaseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el incremento del servicio."));
        return ResponseEntity.ok(toDTO(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractUtilityIncreaseGetDTO>> getByContractUtility(Long contractUtilityId) {
        if (!contractUtilityRepository.existsById(contractUtilityId)) {
            throw new EntityNotFoundException("No se encontró el servicio del contrato.");
        }

        List<ContractUtilityIncrease> increases = contractUtilityIncreaseRepository.findByContractUtilityId(contractUtilityId);

        List<ContractUtilityIncreaseGetDTO> dtos = increases.stream()
                .map(this::toGetDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}