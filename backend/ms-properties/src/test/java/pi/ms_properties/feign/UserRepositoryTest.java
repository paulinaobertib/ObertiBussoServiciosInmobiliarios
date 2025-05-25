package pi.ms_properties.feign;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.dto.feign.UserDTO;
import pi.ms_properties.repository.feign.FeignUserRepository;
import pi.ms_properties.repository.feign.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserRepositoryTest {

    @Mock
    private FeignUserRepository feignUserRepository;

    @InjectMocks
    private UserRepository userRepository;

    // casos de exito

    @Test
    void findById_returnsUser_whenUserExists() {
        UserDTO user = new UserDTO();
        user.setId("123");
        user.setUsername("user123");
        when(feignUserRepository.findById("123")).thenReturn(ResponseEntity.ok(Optional.of(user)));

        UserDTO result = userRepository.findById("123");

        assertNotNull(result);
        assertEquals("123", result.getId());
        assertEquals("user123", result.getUsername());
    }

    @Test
    void exist_returnsTrue_whenUserExists() {
        when(feignUserRepository.exist("123")).thenReturn(true);

        Boolean result = userRepository.exist("123");

        assertTrue(result);
    }

    // casos de error

    @Test
    void findById_returnsNull_whenUserNotFound() {
        when(feignUserRepository.findById("123")).thenReturn(ResponseEntity.ok(Optional.empty()));

        UserDTO result = userRepository.findById("123");

        assertNull(result);
    }

    @Test
    void exist_returnsFalse_whenUserDoesNotExist() {
        when(feignUserRepository.exist("123")).thenReturn(false);

        Boolean result = userRepository.exist("123");

        assertFalse(result);
    }

    @Test
    void findById_returnsNull_whenResponseIsNull() {
        when(feignUserRepository.findById("123")).thenReturn(null);

        UserDTO result = userRepository.findById("123");

        assertNull(result);
    }
}