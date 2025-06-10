package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.ContractIncreaseCurrency;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.dto.ContractDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface IContractService {
    ResponseEntity<?> create(ContractDTO contractDTO, BigDecimal amount, ContractIncreaseCurrency currency);

    ResponseEntity<?> update(ContractDTO contractDTO);

    ResponseEntity<?> updateStatus(Long id);

    ResponseEntity<?> delete(Long id);

    ResponseEntity<?> getById(Long id);

    ResponseEntity<?> getByUserId(String userId);

    ResponseEntity<?> getByPropertyId(Long propertyId);

    ResponseEntity<?> getByType(ContractType type);

    ResponseEntity<?> getByStatus(ContractStatus status);

    ResponseEntity<?> getByDateBetween(LocalDateTime start, LocalDateTime end);

    ResponseEntity<?> getAll();
}
