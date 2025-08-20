package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.UtilityDTO;

import java.util.List;

public interface IUtilityService {
    ResponseEntity<String> create(UtilityDTO utilityDTO);

    ResponseEntity<String> update(UtilityDTO utilityDTO);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<UtilityDTO> getById(Long id);

    ResponseEntity<List<UtilityDTO>> getAll();

    ResponseEntity<UtilityDTO> getByName(String name);

    ResponseEntity<List<ContractSimpleDTO>> getContractsByUtility(Long id);

    ResponseEntity<List<UtilityDTO>> getByContract(Long contractId);
}
