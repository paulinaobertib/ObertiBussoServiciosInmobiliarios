package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractIncreaseCurrency;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.dto.ContractDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface IContractService {
    ResponseEntity<String> create(ContractDTO contractDTO, BigDecimal amount, ContractIncreaseCurrency currency);

    ResponseEntity<String> update(ContractDTO contractDTO);

    ResponseEntity<String> updateStatus(Long id);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<ContractDTO> getById(Long id);

    ResponseEntity<List<ContractDTO>> getByUserId(String userId);

    ResponseEntity<List<ContractDTO>> getByPropertyId(Long propertyId);

    ResponseEntity<List<ContractDTO>> getByType(ContractType type);

    ResponseEntity<List<ContractDTO>> getByStatus(ContractStatus status);

    ResponseEntity<List<ContractDTO>> getByDateBetween(LocalDateTime start, LocalDateTime end);

    ResponseEntity<List<ContractDTO>> getAll();
}
