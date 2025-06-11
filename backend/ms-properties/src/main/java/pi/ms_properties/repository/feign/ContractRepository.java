package pi.ms_properties.repository.feign;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import pi.ms_properties.dto.feign.ContractDTO;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ContractRepository {

    private final FeignUserRepository userRepository;

    public List<ContractDTO> findByPropertyId(Long propertyId) {
        ResponseEntity<List<ContractDTO>> contracts = userRepository.getContractsByPropertyId(propertyId);
        return contracts.getBody();
    }
}
