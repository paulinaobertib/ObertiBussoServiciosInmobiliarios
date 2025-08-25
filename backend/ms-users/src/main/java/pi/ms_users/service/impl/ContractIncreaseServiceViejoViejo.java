/*
package pi.ms_users.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractIncrease;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.User;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.dto.ContractIncreaseDTOContractGet;
import pi.ms_users.dto.EmailContractIncreaseDTO;
import pi.ms_users.repository.IContractIncreaseRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.IEmailService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractIncreaseServiceViejoViejo implements IContractIncreaseServiceViejo {

    private final IContractIncreaseRepository contractIncreaseRepository;

    private final IContractRepository contractRepository;

    private final ObjectMapper objectMapper;

    private final IUserRepository userRepository;

    private final IEmailService emailService;

    @Override
    public ResponseEntity<String> create(ContractIncreaseDTO contractIncreaseDTO) {
        Contract contract = contractRepository.findById(contractIncreaseDTO.getContractId())
                .orElseThrow(() -> new NoSuchElementException("No se ha encontrado el contrato."));

        ContractIncrease contractIncrease = objectMapper.convertValue(contractIncreaseDTO, ContractIncrease.class);
        contractIncrease.setContract(contract);
        contractIncreaseRepository.save(contractIncrease);

        return ResponseEntity.ok("Se ha guardado el monto del contrato");
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        ContractIncrease contractIncrease = contractIncreaseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se ha encontrado el monto."));

        contractIncreaseRepository.delete(contractIncrease);
        return ResponseEntity.ok("Se ha eliminado el monto.");
    }

    @Override
    public ResponseEntity<ContractIncreaseDTO> getById(Long id) {
        ContractIncrease contractIncrease = contractIncreaseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se ha encontrado el monto."));

        if (SecurityUtils.isTenant() &&
                !contractIncrease.getContract().getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        ContractIncreaseDTO contractIncreaseDTO = objectMapper.convertValue(contractIncrease, ContractIncreaseDTO.class);
        contractIncreaseDTO.setContractId(contractIncrease.getContract().getId());

        return ResponseEntity.ok(contractIncreaseDTO);
    }

    @Override
    public ResponseEntity<List<ContractIncreaseDTOContractGet>> getByContract(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new NoSuchElementException("No se ha encontrado el contrato."));

        if (SecurityUtils.isTenant() &&
                !contract.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        List<ContractIncrease> contractIncreases = contractIncreaseRepository.findByContractId(contractId);
        List<ContractIncreaseDTOContractGet> contractIncreaseDTOs = contractIncreases.stream()
                .map(increase -> objectMapper.convertValue(increase, ContractIncreaseDTOContractGet.class))
                .collect(Collectors.toList());

        return ResponseEntity.ok(contractIncreaseDTOs);
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
                BigDecimal newAmount = lastIncrease.getAmount().multiply(BigDecimal.valueOf(1 + contract.getIncrease() / 100.0));

                // Verificar si la fecha de aumento está exactamente a 10 días
                LocalDateTime tenDaysFromNow = LocalDateTime.now().plusDays(10).withHour(0).withMinute(0).withSecond(0).withNano(0);
                LocalDateTime nextIncreaseDateStart = nextIncreaseDate.withHour(0).withMinute(0).withSecond(0).withNano(0);

                // Aplicar el aumento si la fecha ya pasó o es hoy
                if (!nextIncreaseDate.isAfter(LocalDateTime.now())) {
                    ContractIncrease newIncrease = new ContractIncrease();
                    newIncrease.setContract(contract);
                    newIncrease.setDate(nextIncreaseDate);
                    newIncrease.setAmount(newAmount.setScale(2, RoundingMode.HALF_UP));
                    newIncrease.setCurrency(lastIncrease.getCurrency());

                    contractIncreaseRepository.save(newIncrease);
                }

                if (nextIncreaseDateStart.isEqual(tenDaysFromNow)) {
                    // Enviar correo de notificación
                    User user = userRepository.findById(contract.getUserId())
                            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                    EmailContractIncreaseDTO emailData = getEmailContractIncreaseDTO(contract, user, newAmount);

                    try {
                        emailService.sendContractIncreaseEmail(emailData);
                    } catch (Exception e) {
                        // Loggear el error pero no interrumpir el proceso
                        System.err.println("Error al enviar correo de aumento: " + e.getMessage());
                    }
                }
            }
        }
    }

    private static EmailContractIncreaseDTO getEmailContractIncreaseDTO(Contract contract, User user, BigDecimal newAmount) {
        EmailContractIncreaseDTO emailData = new EmailContractIncreaseDTO();
        emailData.setTo(user.getEmail());
        emailData.setTitle("Notificación de Aumento de Contrato");
        emailData.setFirstName(user.getFirstName());
        emailData.setAmount(newAmount);
        emailData.setFrequency(contract.getIncreaseFrequency());
        emailData.setIncrease(contract.getIncrease());
        emailData.setContractId(contract.getId());
        return emailData;
    }
}
*/