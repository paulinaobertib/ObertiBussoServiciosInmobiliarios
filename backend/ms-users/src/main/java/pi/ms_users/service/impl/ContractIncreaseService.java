package pi.ms_users.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractIncrease;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.dto.ContractIncreaseDTOContractGet;
import pi.ms_users.repository.IContractIncreaseRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.service.interf.IContractIncreaseService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractIncreaseService implements IContractIncreaseService {

    private final IContractIncreaseRepository contractIncreaseRepository;

    private final IContractRepository contractRepository;

    private final ObjectMapper objectMapper;

    @Override
    public ResponseEntity<?> create(ContractIncreaseDTO contractIncreaseDTO) {
        try {
            Optional<Contract> contractOptional = contractRepository.findById(contractIncreaseDTO.getContractId());
            if (contractOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato.");
            }

            ContractIncrease contractIncrease = objectMapper.convertValue(contractIncreaseDTO, ContractIncrease.class);
            contractIncrease.setContract(contractOptional.get());

            contractIncreaseRepository.save(contractIncrease);
            return ResponseEntity.ok("Se ha guardado el monto del contrato");

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
            Optional<ContractIncrease> contractIncrease = contractIncreaseRepository.findById(id);
            if (contractIncrease.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el monto.");
            }

            contractIncreaseRepository.delete(contractIncrease.get());
            return ResponseEntity.ok("Se ha eliminado el monto.");

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
            Optional<ContractIncrease> contractIncrease = contractIncreaseRepository.findById(id);
            if (contractIncrease.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el monto.");
            } else {
                ContractIncreaseDTO contractIncreaseDTO = objectMapper.convertValue(contractIncrease, ContractIncreaseDTO.class);
                contractIncreaseDTO.setContractId(contractIncrease.get().getContract().getId());
                return ResponseEntity.ok(contractIncreaseDTO);
            }
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
    public ResponseEntity<?> getByContract(Long contractId) {
        try {
            Optional<Contract> contractOptional = contractRepository.findById(contractId);
            if (contractOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el contrato.");
            }

            List<ContractIncrease> contractIncreases = contractIncreaseRepository.findByContractId(contractId);
            List<ContractIncreaseDTOContractGet> contractIncreaseDTOs = contractIncreases.stream()
                    .map(increase -> objectMapper.convertValue(increase, ContractIncreaseDTOContractGet.class))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(contractIncreaseDTOs);

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

    // Para actualizar automaticamente el monto del contrato

    @Transactional
    public void applyScheduledIncreases() {
        List<Contract> activeContracts = contractRepository.findByStatusAndEndDateAfter(ContractStatus.ACTIVO, LocalDateTime.now());

        for (Contract contract : activeContracts) {
            Optional<ContractIncrease> lastIncreaseOpt = contractIncreaseRepository.findTopByContractOrderByDateDesc(contract);

            if (lastIncreaseOpt.isPresent()) {
                ContractIncrease lastIncrease = lastIncreaseOpt.get();

                LocalDateTime nextIncreaseDate = lastIncrease.getDate().plusDays(contract.getIncreaseFrequency());

                if (!nextIncreaseDate.isAfter(LocalDateTime.now())) {
                    BigDecimal newAmount = lastIncrease.getAmount().multiply(BigDecimal.valueOf(1 + contract.getIncrease() / 100.0));

                    ContractIncrease newIncrease = new ContractIncrease();
                    newIncrease.setContract(contract);
                    newIncrease.setDate(nextIncreaseDate);
                    newIncrease.setAmount(newAmount.setScale(2, RoundingMode.HALF_UP));
                    newIncrease.setCurrency(lastIncrease.getCurrency());

                    // aca tengo que mandar el mail

                    contractIncreaseRepository.save(newIncrease);
                }
            }
        }
    }
}
