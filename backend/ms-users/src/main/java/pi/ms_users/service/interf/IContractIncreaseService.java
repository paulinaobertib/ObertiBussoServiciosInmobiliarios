package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.ContractIncrease;

public interface IContractIncreaseService {
    ResponseEntity<?> create(ContractIncrease contractIncrease);

    ResponseEntity<?> delete(Long id);

    ResponseEntity<?> getById(Long id);

    ResponseEntity<?> getByContract(Long contractId);
}
