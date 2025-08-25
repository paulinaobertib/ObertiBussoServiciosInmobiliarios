package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.IncreaseIndex;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.dto.ContractSimpleDTO;

import java.util.List;

public interface IIncreaseIndexService {
    ResponseEntity<String> create(IncreaseIndex increaseIndex);

    ResponseEntity<String> update(IncreaseIndex increaseIndex);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<IncreaseIndex> getById(Long id);

    ResponseEntity<List<IncreaseIndex>> getAll();

    ResponseEntity<IncreaseIndex> getByName(String name);

    ResponseEntity<IncreaseIndex> getByCode(String code);

    ResponseEntity<List<ContractSimpleDTO>> getContractsByIncreaseIndex(Long id);

    ResponseEntity<IncreaseIndex> getByContract(Long contractId);
}
