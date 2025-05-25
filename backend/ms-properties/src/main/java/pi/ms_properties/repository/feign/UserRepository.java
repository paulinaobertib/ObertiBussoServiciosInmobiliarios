package pi.ms_properties.repository.feign;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import pi.ms_properties.dto.feign.UserDTO;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepository {

    private final FeignUserRepository feignUserRepository;

    public UserDTO findById(String id) {
        ResponseEntity<Optional<UserDTO>> userDTO = feignUserRepository.findById(id);
        if (userDTO == null || userDTO.getBody().isEmpty() || userDTO.getBody().isEmpty()) {
            return null;
        }
        return userDTO.getBody().get();
    }

    public Boolean exist(String id) {
        return feignUserRepository.exist(id);
    }
}
