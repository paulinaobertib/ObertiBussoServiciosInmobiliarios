package pi.ms_users.repository.feign;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import pi.ms_users.dto.feign.PropertyDTO;
import pi.ms_users.dto.feign.Status;

@Repository
@RequiredArgsConstructor
public class PropertyRepository {

    private final FeignPropertyRepository feignPropertyRepository;

    public PropertyDTO getById(Long id) {
        ResponseEntity<PropertyDTO> response = feignPropertyRepository.getSimpleById(id);
        return response.getBody();
    }

    public ResponseEntity<String> updateStatus(Long id, Status status) {
        return feignPropertyRepository.updateStatus(id, status);
    }
}
