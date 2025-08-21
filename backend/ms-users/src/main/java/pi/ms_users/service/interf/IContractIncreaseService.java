package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.dto.ContractIncreaseDTO;

import java.util.List;

public interface IContractIncreaseService {
    ResponseEntity<String> create(ContractIncreaseDTO contractIncreaseDTO);

    ResponseEntity<String> update(ContractIncreaseDTO contractIncreaseDTO);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<String> deleteByContractId(Long contractId);

    ResponseEntity<ContractIncreaseDTO> getById(Long id);

    ResponseEntity<List<ContractIncreaseDTO>> getByContractId(Long contractId);

    ResponseEntity<ContractIncreaseDTO> getLastByContractId(Long contractId);
}

// falta aplicar el aviso de aumento tanto para admin como para inquilino