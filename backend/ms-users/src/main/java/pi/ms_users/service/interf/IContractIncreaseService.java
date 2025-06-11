package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.dto.ContractIncreaseDTO;

public interface IContractIncreaseService {
    ResponseEntity<?> create(ContractIncreaseDTO contractIncreaseDTO);

    ResponseEntity<?> delete(Long id);

    ResponseEntity<?> getById(Long id);

    ResponseEntity<?> getByContract(Long contractId);
}
