package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.dto.ContractUtilityIncreaseDTO;
import pi.ms_users.dto.ContractUtilityIncreaseGetDTO;

import java.util.List;

public interface IContractUtilityIncreaseService {
    ResponseEntity<String> create(ContractUtilityIncreaseDTO dto);

    ResponseEntity<String> update(ContractUtilityIncreaseDTO dto);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<ContractUtilityIncreaseDTO> getById(Long id);

    ResponseEntity<List<ContractUtilityIncreaseGetDTO>> getByContractUtility(Long contractUtilityId);
}
