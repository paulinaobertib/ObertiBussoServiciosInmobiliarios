package pi.ms_properties.feign;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.dto.feign.FavoriteDTO;
import pi.ms_properties.repository.feign.FavoriteRepository;
import pi.ms_properties.repository.feign.FeignUserRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteRepositoryTest {

    @Mock
    private FeignUserRepository feignUserRepository;

    @InjectMocks
    private FavoriteRepository favoriteRepository;

    // casos de exito

    @Test
    void getFavorites_shouldCallFeignClientAndReturnList() {
        String userId = "user123";
        FavoriteDTO dto = new FavoriteDTO();
        dto.setPropertyId(1L);
        dto.setUserId(userId);

        when(feignUserRepository.getByUserIdInternal(userId))
                .thenReturn(List.of(dto));

        List<FavoriteDTO> result = favoriteRepository.getFavorites(userId);

        assertEquals(1, result.size());
        assertEquals(userId, result.getFirst().getUserId());
        verify(feignUserRepository, times(1)).getByUserIdInternal(userId);
    }

    @Test
    void findAllUserIds_shouldCallFeignClientAndReturnUserIds() {
        List<String> userIds = List.of("user1", "user2", "user3");

        when(feignUserRepository.getAllUsers())
                .thenReturn(userIds);

        List<String> result = favoriteRepository.findAllUserIds();

        assertEquals(3, result.size());
        assertTrue(result.contains("user1"));
        verify(feignUserRepository, times(1)).getAllUsers();
    }

    // casos de error

    @Test
    void getFavorites_shouldThrowRuntimeException_whenFeignFails() {
        String userId = "user123";

        when(feignUserRepository.getByUserIdInternal(userId))
                .thenThrow(new RuntimeException("Error al consultar favoritos"));

        assertThrows(RuntimeException.class, () -> favoriteRepository.getFavorites(userId));

        verify(feignUserRepository).getByUserIdInternal(userId);
    }

    @Test
    void getFavorites_shouldThrowNullPointerException_whenFeignReturnsNull() {
        String userId = "user123";

        when(feignUserRepository.getByUserIdInternal(userId))
                .thenReturn(null);

        assertThrows(NullPointerException.class, () ->
            favoriteRepository.getFavorites(userId).size());

        verify(feignUserRepository).getByUserIdInternal(userId);
    }

    @Test
    void findAllUserIds_shouldThrowRuntimeException_whenFeignFails() {
        when(feignUserRepository.getAllUsers())
                .thenThrow(new RuntimeException("Error al obtener usuarios"));

        assertThrows(RuntimeException.class, () -> favoriteRepository.findAllUserIds());

        verify(feignUserRepository).getAllUsers();
    }

    @Test
    void findAllUserIds_shouldThrowNullPointerException_whenFeignReturnsNull() {
        when(feignUserRepository.getAllUsers())
                .thenReturn(null);

        assertThrows(NullPointerException.class, () ->
            favoriteRepository.findAllUserIds().size());

        verify(feignUserRepository).getAllUsers();
    }
}
