package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.dto.ContractIncreaseDTOContractGet;

import java.util.List;

public interface IContractIncreaseService {
    ResponseEntity<String> create(ContractIncreaseDTO contractIncreaseDTO);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<ContractIncreaseDTO> getById(Long id);

    ResponseEntity<List<ContractIncreaseDTOContractGet>> getByContract(Long contractId);
}
