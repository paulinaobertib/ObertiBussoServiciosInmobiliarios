package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.UtilityPeriodicityPayment;
import pi.ms_users.dto.ContractUtilityDTO;
import pi.ms_users.dto.ContractUtilityGetDTO;

import java.util.List;

public interface IContractUtilityService {
    ResponseEntity<String> create(ContractUtilityDTO contractUtilityDTO);

    ResponseEntity<String> update(ContractUtilityDTO contractUtilityDTO);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<String> deleteByContract(Long contractId);

    ResponseEntity<ContractUtilityGetDTO> getById(Long id);

    ResponseEntity<List<ContractUtilityGetDTO>> getByContract(Long contractId);

    ResponseEntity<List<ContractUtilityGetDTO>> getByUtility(Long utilityId);

    ResponseEntity<List<ContractUtilityGetDTO>> getByPeriodicity(UtilityPeriodicityPayment periodicity);
}
