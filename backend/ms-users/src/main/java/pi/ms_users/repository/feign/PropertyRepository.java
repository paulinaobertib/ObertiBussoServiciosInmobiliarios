package pi.ms_users.repository.feign;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.feign.Property;

@Repository
@RequiredArgsConstructor
public class PropertyRepository {

    private final FeignPropertyRepository feignPropertyRepository;

    public Property getById(Long id) {
        ResponseEntity<Property> response = feignPropertyRepository.getSimpleById(id);
        return response.getBody();
    }
}
