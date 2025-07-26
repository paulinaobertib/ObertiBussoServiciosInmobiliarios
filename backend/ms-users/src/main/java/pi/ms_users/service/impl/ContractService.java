package pi.ms_users.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import feign.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.*;
import pi.ms_users.dto.*;
import pi.ms_users.dto.feign.PropertyDTO;
import pi.ms_users.dto.feign.Status;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.IContractIncreaseService;
import pi.ms_users.service.interf.IContractService;
import pi.ms_users.service.interf.IEmailService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {

    private final IContractRepository contractRepository;

    private final IContractIncreaseService contractIncreaseService;

    private final IUserRepository userRepository;

    private final PropertyRepository propertyRepository;

    private final ObjectMapper objectMapper;

    private final IEmailService emailService;

    public ContractDTO mapToDTO(Contract contract) {
        ContractDTO dto = new ContractDTO();
        dto.setId(contract.getId());
        dto.setUserId(contract.getUserId());
        dto.setPropertyId(contract.getPropertyId());
        dto.setContractType(contract.getContractType());
        dto.setStartDate(contract.getStartDate());
        dto.setEndDate(contract.getEndDate());
        dto.setContractStatus(contract.getContractStatus());
        dto.setIncrease(contract.getIncrease());
        dto.setIncreaseFrequency(contract.getIncreaseFrequency());

        List<ContractIncreaseDTO> increases = contract.getContractIncrease().stream().map(increase -> {
            ContractIncreaseDTO increaseDTO = new ContractIncreaseDTO();
            increaseDTO.setId(increase.getId());
            increaseDTO.setDate(increase.getDate());
            increaseDTO.setAmount(increase.getAmount());
            increaseDTO.setCurrency(increase.getCurrency());
            return increaseDTO;
        }).collect(Collectors.toList());

        dto.setContractIncrease(increases);
        return dto;
    }

    @Override
    public ResponseEntity<String> create(ContractDTO contractDTO, BigDecimal amount, ContractIncreaseCurrency currency) {
        PropertyDTO propertyDTO;
        try {
            propertyDTO = propertyRepository.getById(contractDTO.getPropertyId());
        } catch (FeignException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado la propiedad.");
        }

        if (!propertyDTO.getStatus().equals(Status.DISPONIBLE.name())) {
            return ResponseEntity.badRequest().body("La propiedad no se encuentra disponible.");
        }

        User user = userRepository.findById(contractDTO.getUserId())
                .orElseThrow(() -> new NoSuchElementException("No se ha encontrado el usuario."));

        List<String> userRoles = userRepository.addRoleToUser(user.getId(), "tenant");
        if (!userRoles.contains("tenant")) {
            return ResponseEntity.badRequest().body("No se ha podido modificar el rol del usuario.");
        }

        ResponseEntity<String> response = propertyRepository.updateStatus(propertyDTO.getId(), Status.ALQUILADA);
        if (!response.getStatusCode().is2xxSuccessful()) {
            return ResponseEntity.badRequest().body("No se ha podido modificar el estado de la propiedad.");
        }

        Contract contract = objectMapper.convertValue(contractDTO, Contract.class);
        Contract saved = contractRepository.save(contract);

        EmailContractDTO emailData = new EmailContractDTO();
        emailData.setTo(user.getEmail());
        emailData.setTitle("¡Tu contrato está listo!");
        emailData.setFirstName(user.getFirstName());
        emailData.setContractId(saved.getId());
        emailService.sendNewContractEmail(emailData);

        ContractIncrease contractIncrease = new ContractIncrease();
        contractIncrease.setAmount(amount);
        contractIncrease.setCurrency(currency);
        contractIncrease.setDate(contractDTO.getStartDate());
        contractIncrease.setContract(contract);

        ContractIncreaseDTO contractIncreaseDTO = objectMapper.convertValue(contractIncrease, ContractIncreaseDTO.class);
        contractIncreaseDTO.setContractId(contract.getId());

        contractIncreaseService.create(contractIncreaseDTO);

        return ResponseEntity.ok("Se ha creado el contrato.");
    }

    @Override
    public ResponseEntity<String> update(ContractDTO contractDTO) {
        Contract contract = contractRepository.findById(contractDTO.getId())
                .orElseThrow(() -> new NoSuchElementException("No se ha encontrado el contrato."));

        contract.setContractStatus(contractDTO.getContractStatus());
        contract.setContractType(contractDTO.getContractType());

        List<ContractIncrease> contractIncrease = objectMapper.convertValue(
                contractDTO.getContractIncrease(),
                new TypeReference<>() {}
        );

        contract.setContractIncrease(contractIncrease);
        contract.setIncrease(contractDTO.getIncrease());
        contract.setStartDate(contractDTO.getStartDate());
        contract.setEndDate(contractDTO.getEndDate());
        contract.setUserId(contractDTO.getUserId());
        contract.setIncreaseFrequency(contractDTO.getIncreaseFrequency());
        contract.setPropertyId(contractDTO.getPropertyId());

        contractRepository.save(contract);
        return ResponseEntity.ok("Se ha actualizado el contrato");
    }

    @Override
    public ResponseEntity<String> updateStatus(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se ha encontrado el contrato."));

        if (contract.getContractStatus() == ContractStatus.ACTIVO) {
            contract.setContractStatus(ContractStatus.INACTIVO);
        } else {
            contract.setContractStatus(ContractStatus.ACTIVO);
        }

        contractRepository.save(contract);
        return ResponseEntity.ok("Se ha actualizado el estado del contrato a " + contract.getContractStatus());
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se ha encontrado el contrato."));

        contractRepository.delete(contract);
        return ResponseEntity.ok("Se ha eliminado el contrato.");
    }

    @Override
    public ResponseEntity<ContractDTO> getById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se ha encontrado el contrato."));

        if (SecurityUtils.isTenant() &&
                !contract.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        ContractDTO contractDTO = mapToDTO(contract);
        return ResponseEntity.ok(contractDTO);
    }

    @Override
    public ResponseEntity<List<ContractDTO>> getByUserId(String userId) {
        if (!userRepository.exist(userId)) {
            throw new NoSuchElementException("No se ha encontrado el usuario.");
        }

        if (SecurityUtils.isTenant() &&
                !userId.equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        List<Contract> contracts = contractRepository.findByUserId(userId);
        List<ContractDTO> contractDTOs = contracts.stream()
                .map(this::mapToDTO)
                .toList();
        return ResponseEntity.ok(contractDTOs);
    }

    @Override
    public ResponseEntity<List<ContractDTO>> getByPropertyId(Long propertyId) {
        PropertyDTO propertyDTO = propertyRepository.getById(propertyId);
        List<Contract> contracts = contractRepository.findByPropertyId(propertyDTO.getId());
        List<ContractDTO> contractDTOs = contracts.stream()
                .map(this::mapToDTO)
                .toList();
        return ResponseEntity.ok(contractDTOs);
    }

    @Override
    public ResponseEntity<List<ContractDTO>> getByType(ContractType type) {
        List<Contract> contracts = contractRepository.findByType(type);
        List<ContractDTO> contractDTOs = contracts.stream()
                .map(this::mapToDTO)
                .toList();
        return ResponseEntity.ok(contractDTOs);
    }

    @Override
    public ResponseEntity<List<ContractDTO>> getByStatus(ContractStatus status) {
        List<Contract> contracts = contractRepository.findByStatus(status);
        List<ContractDTO> contractDTOs = contracts.stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(contractDTOs);
    }

    @Override
    public ResponseEntity<List<ContractDTO>> getByDateBetween(LocalDateTime start, LocalDateTime end) {
        List<Contract> contracts = contractRepository.findByDateBetween(start, end);
        List<ContractDTO> contractDTOs = contracts.stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(contractDTOs);
    }

    @Override
    public ResponseEntity<List<ContractDTO>> getAll() {
        List<Contract> contracts = contractRepository.findAll();
        List<ContractDTO> contractDTOs = contracts.stream()
                .map(this::mapToDTO)
                .toList();

        return ResponseEntity.ok(contractDTOs);
    }

    // Para actualizar automaticamente el status del contrato a inactivo
    @Transactional
    public void applyScheduledInactive() {
        List<Contract> contracts = contractRepository.findContractsEndingToday(ContractStatus.ACTIVO);
        for (Contract contract : contracts) {
            contract.setContractStatus(ContractStatus.INACTIVO);
            contractRepository.save(contract);
        }
    }

    // Para avisar que faltan 30 dias para terminar el contrato
    @Transactional
    public void applyScheduledSoonInactive() {
        LocalDate targetDate = LocalDate.now().plusDays(30);
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.plusDays(1).atStartOfDay().minusNanos(1);

        List<Contract> contracts = contractRepository.findByStatusAndEndDateBetween(ContractStatus.ACTIVO, startOfDay, endOfDay);

        for (Contract contract : contracts) {
            Optional<User> user = userRepository.findById(contract.getUserId());
            if (user.isEmpty()) continue;

            EmailExpirationContract emailData = new EmailExpirationContract();
            emailData.setTo(user.get().getEmail());
            emailData.setTitle("Tu contrato está por finalizar");
            emailData.setFirstName(user.get().getFirstName());
            emailData.setEndDate(contract.getEndDate());

            try {
                emailService.sendContractExpirationReminder(emailData);
            } catch (Exception e) {
                System.err.println("Error al enviar recordatorio de vencimiento: " + e.getMessage());
            }
        }
    }

    // Para avisar del pago del alquiler
    @Transactional
    public void applyScheduledPayment() {
        if (LocalDate.now().getDayOfMonth() != 1) return;

        List<Contract> contracts = contractRepository.findByStatus(ContractStatus.ACTIVO);

        for (Contract contract : contracts) {
            Optional<User> userOpt = userRepository.findById(contract.getUserId());
            if (userOpt.isEmpty()) continue;

            User user = userOpt.get();

            LocalDateTime now = LocalDateTime.now();
            Optional<ContractIncrease> latestIncreaseOpt = contract.getContractIncrease().stream()
                    .filter(i -> !i.getDate().isAfter(now))
                    .max(Comparator.comparing(ContractIncrease::getDate));

            if (latestIncreaseOpt.isEmpty()) {
                System.err.println("Contrato sin aumentos vigentes: " + contract.getId());
                continue;
            }

            ContractIncrease latestIncrease = latestIncreaseOpt.get();

            EmailPaymentReminderDTO reminder = new EmailPaymentReminderDTO();
            reminder.setTo(user.getEmail());
            reminder.setFirstName(user.getFirstName());
            reminder.setDueDate(LocalDate.now());
            reminder.setAmount(latestIncrease.getAmount());
            reminder.setCurrency(latestIncrease.getCurrency());

            try {
                emailService.sendRentPaymentReminder(reminder);
            } catch (Exception e) {
                System.err.println("Error al enviar recordatorio de alquiler: " + e.getMessage());
            }
        }
    }
}