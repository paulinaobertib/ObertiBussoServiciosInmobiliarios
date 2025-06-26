package pi.ms_properties.repository.feign;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pi.ms_properties.dto.feign.FavoriteDTO;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FavoriteRepository {

    private final FeignUserRepository userRepository;

    public List<FavoriteDTO> getFavorites(String userId) {
        return userRepository.getByUserIdInternal(userId);
    }

    public List<String> findAllUserIds() {
        return userRepository.getAllUsers();
    }
}
