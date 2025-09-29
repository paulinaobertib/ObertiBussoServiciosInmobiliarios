package pi.ms_users.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.*;
import pi.ms_users.dto.*;
import pi.ms_users.dto.email.*;
import pi.ms_users.dto.feign.PropertyDTO;
import pi.ms_users.dto.feign.Status;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IIncreaseIndexRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.IContractService;
import pi.ms_users.service.interf.IEmailService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {

    private final IContractRepository contractRepository;

    private final IIncreaseIndexRepository increaseIndexRepository;

    private final IUserRepository userRepository;

    private final IEmailService emailService;

    private final PropertyRepository propertyRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional(readOnly = true)
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
        dto.setHasDeposit(entity.isHasDeposit());
        dto.setDepositAmount(entity.getDepositAmount());
        dto.setDepositNote(entity.getDepositNote());

        dto.setAdjustmentIndex(mapIncreaseIndex(entity.getAdjustmentIndex()));

        dto.setContractUtilities(entity.getContractUtilities() == null ? List.of()
                        : entity.getContractUtilities().stream()
                        .map(this::mapContractUtility)
                        .toList()
        );

        dto.setContractIncrease(entity.getContractIncrease() == null ? List.of()
                        : entity.getContractIncrease().stream()
                        .map(this::mapContractIncrease)
                        .toList()
        );

        dto.setCommission(mapCommission(entity.getCommission()));

        dto.setPayments(entity.getPayments() == null ? List.of()
                        : entity.getPayments().stream()
                        .map(this::mapPayment)
                        .toList()
        );

        dto.setGuarantors(entity.getGuarantors() == null ? Set.of()
                : entity.getGuarantors().stream()
                .map(this::mapGuarantor)
                .collect(Collectors.toSet()));

        return dto;
    }

    private IncreaseIndexContractDTO mapIncreaseIndex(IncreaseIndex ii) {
        if (ii == null) return null;
        IncreaseIndexContractDTO d = new IncreaseIndexContractDTO();
        d.setId(ii.getId());
        d.setCode(ii.getCode());
        d.setName(ii.getName());
        return d;
    }

    private ContractUtilityContractDTO mapContractUtility(ContractUtility cu) {
        ContractUtilityContractDTO d = new ContractUtilityContractDTO();
        d.setId(cu.getId());
        d.setPeriodicity(cu.getPeriodicity());
        d.setInitialAmount(cu.getInitialAmount());
        d.setLastPaidAmount(cu.getLastPaidAmount());
        d.setLastPaidDate(cu.getLastPaidDate());
        d.setNotes(cu.getNotes());
        d.setUtilityId(cu.getUtility() != null ? cu.getUtility().getId() : null);
        if (cu.getIncreases() != null) {
            List<ContractUtilityIncreaseGetDTO> increases = cu.getIncreases().stream()
                    .map(i -> {
                        ContractUtilityIncreaseGetDTO incDto = new ContractUtilityIncreaseGetDTO();
                        incDto.setId(i.getId());
                        incDto.setAdjustmentDate(i.getAdjustmentDate());
                        incDto.setAmount(i.getAmount());
                        return incDto;
                    }).toList();
            d.setIncreases(increases);
        }
        return d;
    }

    private ContractIncreaseContractDTO mapContractIncrease(ContractIncrease ci) {
        ContractIncreaseContractDTO d = new ContractIncreaseContractDTO();
        d.setId(ci.getId());
        d.setDate(ci.getDate());
        d.setCurrency(ci.getCurrency());
        d.setAmount(ci.getAmount());
        d.setAdjustment(ci.getAdjustment());
        d.setNote(ci.getNote());
        d.setPeriodFrom(ci.getPeriodFrom());
        d.setPeriodTo(ci.getPeriodTo());
        d.setIndexId(ci.getIndex() != null ? ci.getIndex().getId() : null);
        return d;
    }

    private CommissionContractDTO mapCommission(Commission c) {
        if (c == null) return null;
        CommissionContractDTO d = new CommissionContractDTO();
        d.setId(c.getId());
        d.setCurrency(c.getCurrency());
        d.setTotalAmount(c.getTotalAmount());
        d.setDate(c.getDate());
        d.setPaymentType(c.getPaymentType());
        d.setInstallments(c.getInstallments());
        d.setStatus(c.getStatus());
        d.setNote(c.getNote());
        return d;
    }

    private PaymentContractDTO mapPayment(Payment p) {
        PaymentContractDTO d = new PaymentContractDTO();
        d.setId(p.getId());
        d.setPaymentCurrency(p.getPaymentCurrency());
        d.setAmount(p.getAmount());
        d.setDate(p.getDate());
        d.setDescription(p.getDescription());
        d.setConcept(p.getConcept());
        d.setContractUtilityId(p.getContractUtility() != null ? p.getContractUtility().getId() : null);
        d.setCommissionId(p.getCommission() != null ? p.getCommission().getId() : null);
        return d;
    }

    private GuarantorGetContractDTO mapGuarantor(Guarantor g) {
        GuarantorGetContractDTO d = new GuarantorGetContractDTO();
        d.setId(g.getId());
        d.setName(g.getName());
        d.setPhone(g.getPhone());
        d.setEmail(g.getEmail());
        return d;
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
        dto.setHasDeposit(entity.isHasDeposit());
        dto.setDepositAmount(entity.getDepositAmount());
        dto.setDepositNote(entity.getDepositNote());
        dto.setAdjustmentIndexId(entity.getAdjustmentIndex() != null ? entity.getAdjustmentIndex().getId() : null);
        dto.setContractUtilitiesIds(entity.getContractUtilities().stream().map(ContractUtility::getId).collect(Collectors.toList()));
        dto.setCommissionId(entity.getCommission() != null ? entity.getCommission().getId() : null);
        dto.setPaymentsIds(entity.getPayments().stream().map(Payment::getId).collect(Collectors.toList()));
        dto.setGuarantorsIds(entity.getGuarantors() == null ? Set.of()
                : entity.getGuarantors().stream()
                .map(Guarantor::getId)
                .collect(Collectors.toSet()));
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

        if (dto.getHasDeposit() != null) {
            entity.setHasDeposit(dto.getHasDeposit());
        }

        if (Boolean.TRUE.equals(dto.getHasDeposit())) {
            entity.setDepositAmount(dto.getDepositAmount());
            entity.setDepositNote(dto.getDepositNote());
        } else {
            entity.setDepositAmount(null);
            entity.setDepositNote(null);
        }

        if (dto.getAdjustmentIndexId() != null) {
            entity.setAdjustmentIndex(em.getReference(IncreaseIndex.class, dto.getAdjustmentIndexId()));
        }

        if (dto.getGuarantorsIds() != null && !dto.getGuarantorsIds().isEmpty()) {
            Set<Guarantor> gs = dto.getGuarantorsIds().stream()
                    .map(id -> em.getReference(Guarantor.class, id))
                    .collect(Collectors.toSet());
            entity.setGuarantors(gs);
        } else {
            entity.getGuarantors().clear();
        }

        return entity;
    }

    private void validateDeposit(Boolean hasDeposit, BigDecimal amount, String note) {
        boolean hd = Boolean.TRUE.equals(hasDeposit);
        if (hd && (amount == null || amount.compareTo(BigDecimal.ZERO) < 0)) {
            throw new BadRequestException("Si hasDeposit=true, depositAmount debe ser >= 0.");
        }
        if (!hd && (amount != null || note != null)) {
            throw new BadRequestException("Si hasDeposit=false, depositAmount y depositNote deben ser null.");
        }
    }

    @Override
    @Transactional
    public ResponseEntity<String> create(ContractDTO contractDTO) {
        boolean existsActive = contractRepository.existsByPropertyIdAndContractStatus(
                contractDTO.getPropertyId(), ContractStatus.ACTIVO);

        if (existsActive) {
            throw new BadRequestException("La propiedad ya tiene un contrato activo.");
        }

        if (contractDTO.getAdjustmentIndexId() == null || !increaseIndexRepository.existsById(contractDTO.getAdjustmentIndexId())) {
            throw new EntityNotFoundException("No se ha encontrado el índice de aumento con ID: " + contractDTO.getAdjustmentIndexId());
        }

        User user = userRepository.findById(contractDTO.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario."));

        userRepository.addRoleToUser(user.getId(), "tenant");

        if (contractDTO.getPropertyId() == null) {
            throw new BadRequestException("No se ha cargado el id de la propiedad.");
        }

        PropertyDTO propertyDTO = propertyRepository.getById(contractDTO.getPropertyId());
        if (propertyDTO == null) {
            throw new EntityNotFoundException("No se ha encontrado la propiedad.");
        }

        if (contractDTO.getHasDeposit()) {
            validateDeposit(true, contractDTO.getDepositAmount(), contractDTO.getDepositNote());
        }

        Contract entity = toEntity(contractDTO);

        propertyRepository.updateStatus(entity.getPropertyId(), Status.ALQUILADA);

        Contract contract = contractRepository.save(entity);

        EmailNewContractDTO emailNewContractDTO = new EmailNewContractDTO();
        emailNewContractDTO.setTo(user.getEmail());
        emailNewContractDTO.setFirstName(user.getFirstName());
        emailNewContractDTO.setLastName(user.getLastName());
        emailNewContractDTO.setStartDate(contract.getStartDate());
        emailNewContractDTO.setEndDate(contract.getEndDate());

        emailService.sendNewContractEmail(emailNewContractDTO, contract.getId());

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
        
        // Esto agregó Tomi, era lo que falta creo pero no funciona, no se
        // if (contractDTO.getDepositAmount() != null) entity.setDepositAmount(contractDTO.getDepositAmount());
        // if (contractDTO.getDepositNote() != null) entity.setDepositNote(contractDTO.getDepositNote());

        if (contractDTO.getAdjustmentIndexId() != null) {
            entity.setAdjustmentIndex(em.getReference(IncreaseIndex.class, contractDTO.getAdjustmentIndexId()));
        }

        contractRepository.save(entity);

        return ResponseEntity.ok("Se ha actualizado el contrato.");
    }

    @Override
    public ResponseEntity<String> updateStatus(Long contractId) {
        Contract entity = contractRepository.findById(contractId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato."));

        User user = userRepository.findById(entity.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario."));

        ContractStatus status = entity.getContractStatus();

        if (status == ContractStatus.ACTIVO) {
            entity.setContractStatus(ContractStatus.INACTIVO);

            userRepository.deleteRoleToUser(user.getId(), "tenant");

            EmailExpiredContractDTO emailExpiredContractDTO = new EmailExpiredContractDTO();
            emailExpiredContractDTO.setTo(user.getEmail());
            emailExpiredContractDTO.setFirstName(user.getFirstName());
            emailExpiredContractDTO.setLastName(user.getLastName());
            emailExpiredContractDTO.setEndDate(entity.getEndDate());

            emailService.sendContractExpiredEmail(emailExpiredContractDTO);
        } else {
            entity.setContractStatus(ContractStatus.ACTIVO);
            userRepository.addRoleToUser(user.getId(), "tenant");
        }

        contractRepository.save(entity);

        return ResponseEntity.ok("Se ha actualizado el estado del contrato.");
    }

    @Override
    @Transactional
    public ResponseEntity<String> delete(Long id) {
        Optional<Contract> contract = contractRepository.findById(id);
        if (contract.isEmpty()) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }

        contractRepository.deleteById(id);

        propertyRepository.updateStatus(contract.get().getPropertyId(), Status.ESPERA);

        Optional<User> user = userRepository.findById(contract.get().getUserId());

        userRepository.deleteRoleToUser(user.get().getId(), "tenant");

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
        if (SecurityUtils.isUser() && !userId.equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }
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

    @Override
    public List<Contract> getContractsWithIncreaseInOneMonth() {
        LocalDate today = LocalDate.now();
        LocalDate targetDate = today.plusDays(30);

        return contractRepository.findAll().stream()
                .filter(c -> {
                    ContractIncrease lastIncrease = c.getContractIncrease().stream()
                            .max(Comparator.comparing(ContractIncrease::getDate))
                            .orElse(null);

                    if (lastIncrease == null) return false;

                    LocalDate nextIncreaseDate = lastIncrease.getDate().toLocalDate()
                            .plusMonths(c.getAdjustmentFrequencyMonths());

                    return nextIncreaseDate.equals(targetDate);
                })
                .toList();
    }

    @Override
    public void sendEmailsForContractsWithIncreaseInOneMonth() {
        List<Contract> contracts = getContractsWithIncreaseInOneMonth();

        contracts.forEach(contract -> {
            Optional<User> user = userRepository.findById(contract.getUserId());

            if (!user.isEmpty()) {
                ContractIncrease lastIncrease = contract.getContractIncrease().stream()
                        .max(Comparator.comparing(ContractIncrease::getDate))
                        .orElse(null);

                if (lastIncrease != null) {
                    EmailContractUpcomingIncreaseOneMonthDTO dto = new EmailContractUpcomingIncreaseOneMonthDTO();
                    dto.setTo(user.get().getEmail());
                    dto.setFirstName(user.get().getFirstName());
                    dto.setLastName(user.get().getLastName());
                    dto.setIndex(contract.getAdjustmentIndex().getName());

                    emailService.sendContractUpcomingIncreaseOneMonthEmail(dto, contract.getId());
                }
            }
        });
    }

    @Override
    public void sendAdminContractsWithIncreaseInOneMonth() {
        List<Contract> contracts = getContractsWithIncreaseInOneMonth();

        List<ContractToIncreaseForAdminEmailDTO> list = contracts.stream()
                .map(c -> {
                    Optional<User> user = userRepository.findById(c.getUserId());

                    if (!user.isEmpty()) {
                        ContractIncrease lastIncrease = c.getContractIncrease().stream()
                                .max(Comparator.comparing(ContractIncrease::getDate))
                                .orElse(null);

                        ContractToIncreaseForAdminEmailDTO dto = new ContractToIncreaseForAdminEmailDTO();
                        dto.setContractId(c.getId());
                        dto.setTenantFullName(user.get().getFirstName() + " " + user.get().getLastName());
                        dto.setIncreaseDate(lastIncrease != null ? lastIncrease.getDate().toLocalDate().plusMonths(c.getAdjustmentFrequencyMonths()) : null);
                        dto.setIndexName(c.getAdjustmentIndex().getName());
                        return dto;
                    }

                    return null;
                })
                .toList();

        if (!list.isEmpty()) {
            EmailContractIncreaseAdminDTO dto = new EmailContractIncreaseAdminDTO();
            dto.setContracts(list);
            emailService.sendAdminContractUpcomingIncreaseListEmail(dto);
        }
    }

    @Override
    public void sendEmailsForContractsExpiringInOneMonth() {
        LocalDate targetDate = LocalDate.now().plusMonths(1);

        List<Contract> contracts = contractRepository.findContractsExpiringInOneMonth(targetDate);

        contracts.forEach(contract -> {
            Optional<User> user = userRepository.findById(contract.getUserId());

            if (!user.isEmpty()) {
                EmailContractExpiringSoonDTO dto = new EmailContractExpiringSoonDTO();
                dto.setTo(user.get().getEmail());
                dto.setFirstName(user.get().getFirstName());
                dto.setLastName(user.get().getLastName());
                dto.setEndDate(contract.getEndDate());

                emailService.sendContractExpiringSoonEmail(dto, contract.getId());
            }
        });

        List<ContractExpiringForAdminDTO> list = contracts.stream()
                .map(c -> {
                    Optional<User> user = userRepository.findById(c.getUserId());
                    if (!user.isEmpty()) {
                        ContractExpiringForAdminDTO dto = new ContractExpiringForAdminDTO();
                        dto.setContractId(c.getId());
                        dto.setEndDate(c.getEndDate());
                        dto.setTenantFullName(user.get().getFirstName() + " " + user.get().getLastName());
                        return dto;
                    }
                    return null;
                })
                .toList();

        if (!list.isEmpty()) {
            EmailContractExpiringSoonListAdminDTO dto = new EmailContractExpiringSoonListAdminDTO();
            dto.setContracts(list);

            emailService.sendAdminContractsExpiringSoonListEmail(dto);
        }
    }

    @Override
    public void sendEmailsForContractsExpiringToday() {
        LocalDate today = LocalDate.now();

        List<Contract> contracts = contractRepository.findContractsExpiringToday(today);

        contracts.forEach(contract -> {
            Optional<User> user = userRepository.findById(contract.getUserId());

            userRepository.deleteRoleToUser(user.get().getId(), "tenant");

            propertyRepository.updateStatusEspera(contract.getPropertyId());

            if (!user.isEmpty()) {
                updateStatus(contract.getId());

                EmailContractExpiredAdminDTO emailContractExpiredAdminDTO = new EmailContractExpiredAdminDTO();
                emailContractExpiredAdminDTO.setContractId(contract.getId());
                emailContractExpiredAdminDTO.setPropertyId(contract.getPropertyId());
                emailContractExpiredAdminDTO.setTenant(user.get().getFirstName()  + " " + user.get().getLastName());

                emailService.sendAdminContractExpiredEmail(emailContractExpiredAdminDTO);
            }
        });
    }

    @Override
    public void sendPaymentRemindersForActiveContracts() {
        LocalDate today = LocalDate.now();
        LocalDate oneMonthFromNow = LocalDate.now().plusMonths(1);

        List<Contract> contracts = contractRepository.findActiveContractsNotExpiringNextMonth(oneMonthFromNow);

        contracts.forEach(contract -> {
            Optional<User> user = userRepository.findById(contract.getUserId());

            if (!user.isEmpty()) {
                EmailContractPaymentReminderDTO dto = new EmailContractPaymentReminderDTO();
                dto.setTo(user.get().getEmail());
                dto.setFirstName(user.get().getFirstName());
                dto.setLastName(user.get().getLastName());

                LocalDate dueDate = today.plusMonths(1).withDayOfMonth(10);
                dto.setDueDate(dueDate);

                dto.setAmount(contract.getLastPaidAmount() != null ? contract.getLastPaidAmount() : contract.getInitialAmount());
                dto.setCurrency(contract.getCurrency().name());

                emailService.sendContractPaymentReminderEmail(dto, contract.getId());
            }
        });
    }

    @Override
    @Transactional
    public ResponseEntity<String> updatePropertyStatusAndContract(Long propertyId, Long contractId, Status status) {
        PropertyDTO propertyDTO = propertyRepository.getById(propertyId);
        if (propertyDTO == null) {
            throw new EntityNotFoundException("No se ha encontrado la propiedad.");
        }

        Contract entity = contractRepository.findById(contractId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato con ID: " + contractId));

        User user = userRepository.findById(entity.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el usuario."));

        entity.setContractStatus(ContractStatus.INACTIVO);
        contractRepository.save(entity);
        propertyRepository.updateStatus(propertyId, status);

        if (user != null) {
            userRepository.deleteRoleToUser(user.getId(), "tenant");

            EmailExpiredContractDTO emailExpiredContractDTO = new EmailExpiredContractDTO();
            emailExpiredContractDTO.setTo(user.getEmail());
            emailExpiredContractDTO.setFirstName(user.getFirstName());
            emailExpiredContractDTO.setLastName(user.getLastName());
            emailExpiredContractDTO.setEndDate(entity.getEndDate());

            emailService.sendContractExpiredEmail(emailExpiredContractDTO);
        }

        return ResponseEntity.ok("Se ha actualizado el estado de la propiedad y del contrato.");
    }
}