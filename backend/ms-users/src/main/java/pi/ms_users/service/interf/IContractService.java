package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractIncreaseCurrency;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface IContractService {
    ResponseEntity<?> create(Contract contract, BigDecimal amount, ContractIncreaseCurrency currency);

    ResponseEntity<?> update(Contract contract);

    ResponseEntity<?> updateStatus(Long id);

    ResponseEntity<?> delete(Long id);

    ResponseEntity<?> getById(Long id);

    ResponseEntity<?> getByUserId(String userId);

    ResponseEntity<?> getByPropertyId(Long propertyId);

    ResponseEntity<?> getByType(ContractType type);

    ResponseEntity<?> getByStatus(ContractStatus status);

    ResponseEntity<?> getByDateBetween(Long contractId, LocalDateTime start, LocalDateTime end);

    ResponseEntity<?> getAll();
}

// renovacion
// traer todos los usuarios con rol de inquilino
// metodo en owner de q devuelva sus contratos