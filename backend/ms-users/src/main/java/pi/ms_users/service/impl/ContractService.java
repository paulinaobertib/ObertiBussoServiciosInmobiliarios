package pi.ms_users.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.*;
import pi.ms_users.domain.feign.Property;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.dto.EmailContractDTO;
import pi.ms_users.dto.EmailExpirationContract;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.service.interf.IContractIncreaseService;
import pi.ms_users.service.interf.IContractService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {

    private final IContractRepository contractRepository;

    private final IContractIncreaseService contractIncreaseService;

    private final IUserRepository userRepository;

    private final PropertyRepository propertyRepository;

    private final ObjectMapper objectMapper;

    private final EmailService emailService;

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
    public ResponseEntity<?> create(ContractDTO contractDTO, BigDecimal amount, ContractIncreaseCurrency currency) {
        try {
            Property property = propertyRepository.getById(contractDTO.getPropertyId());
            Optional<User> user = userRepository.findById(contractDTO.getUserId());
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No se ha encontrado el usuario.");
            }

            Contract contract = objectMapper.convertValue(contractDTO, Contract.class);

            contractRepository.save(contract);

            EmailContractDTO emailData = new EmailContractDTO();
            emailData.setTo(user.get().getMail());
            emailData.setTitle("¡Tu contrato está listo!");
            emailData.setName(user.get().getFirstName());

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

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> update(ContractDTO contractDTO) {
        try {
            Optional<Contract> contractOptional = contractRepository.findById(contractDTO.getId());
            if (contractOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato.");
            }

            Contract contractGet = contractOptional.get();

            contractGet.setContractStatus(contractDTO.getContractStatus());
            contractGet.setContractType(contractDTO.getContractType());

            List<ContractIncrease> contractIncrease = objectMapper.convertValue(
                    contractDTO.getContractIncrease(),
                    new TypeReference<List<ContractIncrease>>() {}
            );

            contractGet.setContractIncrease(contractIncrease);
            contractGet.setIncrease(contractDTO.getIncrease());
            contractGet.setStartDate(contractDTO.getStartDate());
            contractGet.setEndDate(contractDTO.getEndDate());
            contractGet.setUserId(contractDTO.getUserId());
            contractGet.setIncreaseFrequency(contractDTO.getIncreaseFrequency());
            contractGet.setPropertyId(contractDTO.getPropertyId());

            contractRepository.save(contractGet);
            return ResponseEntity.ok("Se ha actualizado el contrato");

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> updateStatus(Long id) {
        try {
            Optional<Contract> contractOptional = contractRepository.findById(id);
            if (contractOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato.");
            }

            Contract contract = contractOptional.get();

            if (contract.getContractStatus() == ContractStatus.ACTIVO) {
                contract.setContractStatus(ContractStatus.INACTIVO);
            } else {
                contract.setContractStatus(ContractStatus.ACTIVO);
            }
            contractRepository.save(contract);
            return ResponseEntity.ok("Se ha actualizado el estado del contrato a " + contract.getContractStatus());

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> delete(Long id) {
        try {
            Optional<Contract> contract = contractRepository.findById(id);
            if (contract.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato.");
            }
            contractRepository.delete(contract.get());
            return ResponseEntity.ok("Se ha eliminado el contrato.");

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getById(Long id) {
        try {
            Optional<Contract> contract = contractRepository.findById(id);
            if (contract.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato.");
            }

            ContractDTO contractDTO = mapToDTO(contract.get());

            return ResponseEntity.ok(contractDTO);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getByUserId(String userId) {
        try {
            Boolean existUser = userRepository.exist(userId);
            if (!existUser) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No se ha encontrado el usuario.");
            }
            List<Contract> contracts = contractRepository.findByUserId(userId);

            List<ContractDTO> contractDTOs = contracts.stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(contractDTOs);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<List<ContractDTO>> getByPropertyId(Long propertyId) {
        try {
            Property property = propertyRepository.getById(propertyId);
            // puedo tener varios, porque puede haber tanto activos como inactivos
            List<Contract> contracts = contractRepository.findByPropertyId(property.getId());
            List<ContractDTO> contractDTOs = contracts.stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(contractDTOs);

        } catch (DataIntegrityViolationException | ConstraintViolationException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<?> getByType(ContractType type) {
        try {
            List<Contract> contracts = contractRepository.findByType(type);
            List<ContractDTO> contractDTOs = contracts.stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(contractDTOs);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getByStatus(ContractStatus status) {
        try {
            List<Contract> contracts = contractRepository.findByStatus(status);
            List<ContractDTO> contractDTOs = contracts.stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(contractDTOs);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getByDateBetween(LocalDateTime start, LocalDateTime end) {
        try {
            List<Contract> contracts = contractRepository.findByDateBetween(start, end);
            List<ContractDTO> contractDTOs = contracts.stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(contractDTOs);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> getAll() {
        try {
            List<Contract> contracts = contractRepository.findAll();
            List<ContractDTO> contractDTOs = contracts.stream()
                    .map(this::mapToDTO)
                    .toList();

            return ResponseEntity.ok(contractDTOs);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
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
            emailData.setTo(user.get().getMail());
            emailData.setTitle("Tu contrato está por finalizar");
            emailData.setName(user.get().getFirstName());
            emailData.setEndDate(contract.getEndDate());

            try {
                emailService.sendContractExpirationReminder(emailData);
            } catch (Exception e) {
                System.err.println("Error al enviar recordatorio de vencimiento: " + e.getMessage());
            }
        }
    }


}
