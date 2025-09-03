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
import pi.ms_users.dto.ContractUtilityDTO;
import pi.ms_users.dto.ContractUtilityGetDTO;
import pi.ms_users.dto.ContractUtilityIncreaseGetDTO;
import pi.ms_users.dto.email.EmailExtraAdminDTO;
import pi.ms_users.dto.email.EmailUtilityPaymentReminderDTO;
import pi.ms_users.dto.email.ExtrasForAdminEmailDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IContractUtilityRepository;
import pi.ms_users.repository.IUtilityRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.interf.IContractUtilityService;
import pi.ms_users.service.interf.IEmailService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ContractUtilityService implements IContractUtilityService {

    private final IContractUtilityRepository contractUtilityRepository;

    private final IContractRepository contractRepository;

    private final IUtilityRepository utilityRepository;

    private final IUserRepository userRepository;

    private final IEmailService emailService;

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

        if (entity.getIncreases() != null) {
            List<ContractUtilityIncreaseGetDTO> increases = entity.getIncreases().stream()
                    .map(i -> {
                        ContractUtilityIncreaseGetDTO incDto = new ContractUtilityIncreaseGetDTO();
                        incDto.setId(i.getId());
                        incDto.setAdjustmentDate(i.getAdjustmentDate());
                        incDto.setAmount(i.getAmount());
                        return incDto;
                    }).toList();
            dto.setIncreases(increases);
        }

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
    @Transactional
    public ResponseEntity<String> create(ContractUtilityDTO contractUtilityDTO) {
        if (contractUtilityDTO.getContractId() == null) throw new BadRequestException("Falta contractId.");
        if (contractUtilityDTO.getUtilityId() == null)  throw new BadRequestException("Falta utilityId.");

        if (contractUtilityDTO.getId() != null) throw new BadRequestException("El id debe ser null al crear.");

        Optional<Contract> contract = contractRepository.findById(contractUtilityDTO.getContractId());
        if (contract.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }

        Optional<Utility> utility = utilityRepository.findById(contractUtilityDTO.getUtilityId());
        if (utility.isEmpty()) {
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
    @Transactional
    public ResponseEntity<String> delete(Long id) {
        if (!contractUtilityRepository.existsById(id)) {
            throw new EntityNotFoundException("No se ha encontrado el servicio del contrato.");
        }
        contractUtilityRepository.deleteById(id);
        return ResponseEntity.ok("Se ha eliminado el servicio del contrato.");
    }

    @Override
    @Transactional
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

    public List<ContractUtility> getUtilitiesDueInTenDays() {
        LocalDate targetDate = LocalDate.now().plusDays(10);

        return contractUtilityRepository.findAll().stream()
                .filter(cu -> {
                    if (cu.getLastPaidDate() == null) return false;

                    LocalDate lastPaid = cu.getLastPaidDate().toLocalDate();
                    LocalDate nextDueDate;

                    switch (cu.getPeriodicity()) {
                        case MENSUAL -> nextDueDate = lastPaid.plusMonths(1);
                        case BIMENSUAL -> nextDueDate = lastPaid.plusMonths(2);
                        case TRIMESTRAL -> nextDueDate = lastPaid.plusMonths(3);
                        case SEMESTRAL -> nextDueDate = lastPaid.plusMonths(6);
                        case ANUAL -> nextDueDate = lastPaid.plusYears(1);
                        default -> nextDueDate = lastPaid;
                    }

                    return nextDueDate.equals(targetDate);
                })
                .toList();
    }

    public void sendAdminUtilitiesDueInTenDays() {
        List<ContractUtility> utilities = getUtilitiesDueInTenDays();

        List<ExtrasForAdminEmailDTO> list = utilities.stream()
                .map(u -> {
                    Optional<User> user = userRepository.findById(u.getContract().getUserId());

                    if (!user.isEmpty()) {
                        ExtrasForAdminEmailDTO dto = new ExtrasForAdminEmailDTO();
                        dto.setContractId(u.getContract().getId());
                        dto.setTenantFullName(user.get().getFirstName() + " " + user.get().getLastName());
                        dto.setUtilityName(u.getUtility().getName());
                        dto.setPeriodicity(u.getPeriodicity().name());
                        return dto;
                    }

                    return null;
                })
                .toList();

        if (!list.isEmpty()) {
            EmailExtraAdminDTO dto = new EmailExtraAdminDTO();
            dto.setUtilities(list);
            emailService.sendAdminUtilityUpcomingChargeListEmail(dto);
        }
    }

    public void sendEmailsForUtilitiesDueInTenDays() {
        List<ContractUtility> utilities = getUtilitiesDueInTenDays();

        utilities.forEach(u -> {
            Optional<User> user = userRepository.findById(u.getContract().getUserId());

            if (!user.isEmpty()) {
                EmailUtilityPaymentReminderDTO dto = new EmailUtilityPaymentReminderDTO();
                dto.setTo(user.get().getEmail());
                dto.setFirstName(user.get().getFirstName());
                dto.setLastName(user.get().getLastName());
                dto.setUtilityName(u.getUtility().getName());
                dto.setPeriodicity(u.getPeriodicity().name());

                emailService.sendUtilityPaymentReminderEmail(dto, u.getContract().getId());
            }
        });
    }
}