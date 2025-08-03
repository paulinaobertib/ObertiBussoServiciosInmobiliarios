package pi.ms_users.feignTest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_users.dto.feign.PropertyDTO;
import pi.ms_users.dto.feign.Status;
import pi.ms_users.repository.feign.FeignPropertyRepository;
import pi.ms_users.repository.feign.PropertyRepository;

import java.time.LocalDateTime;

@ExtendWith(MockitoExtension.class)
public class PropertyRepositoryTest {

    @Mock
    private FeignPropertyRepository feignPropertyRepository;

    @InjectMocks
    private PropertyRepository propertyRepository;

    // casos de exito

    @Test
    void getById_returnsPropertySuccessfully() {
        Long propertyId = 1L;
        PropertyDTO mockPropertyDTO = new PropertyDTO(
                propertyId, "Casa en venta", 100000f, "Linda casa",
                LocalDateTime.now(), "imagen.jpg", "DISPONIBLE", "VENTA",
                "USD", "Centro", "Casa");

        when(feignPropertyRepository.getSimpleById(propertyId))
                .thenReturn(ResponseEntity.ok(mockPropertyDTO));

        PropertyDTO result = propertyRepository.getById(propertyId);

        assertNotNull(result);
        assertEquals("Casa en venta", result.getTitle());
        verify(feignPropertyRepository, times(1)).getSimpleById(propertyId);
    }

    @Test
    void updateStatus_returnsOkResponse() {
        Long propertyId = 1L;
        Status newStatus = Status.ALQUILADA;

        when(feignPropertyRepository.updateStatus(propertyId, newStatus))
                .thenReturn(ResponseEntity.ok("Estado actualizado"));

        ResponseEntity<String> response = propertyRepository.updateStatus(propertyId, newStatus);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Estado actualizado", response.getBody());
        verify(feignPropertyRepository, times(1)).updateStatus(propertyId, newStatus);
    }

    // casos de error

    @Test
    void getById_whenFeignThrowsException_thenPropagatesException() {
        Long propertyId = 99L;

        when(feignPropertyRepository.getSimpleById(propertyId))
                .thenThrow(new RuntimeException("No se pudo conectar"));

        assertThrows(RuntimeException.class, () -> propertyRepository.getById(propertyId));

        verify(feignPropertyRepository, times(1)).getSimpleById(propertyId);
    }

    @Test
    void updateStatus_whenFeignThrowsException_thenPropagatesException() {
        Long propertyId = 1L;
        Status newStatus = Status.RESERVADA;

        when(feignPropertyRepository.updateStatus(propertyId, newStatus))
                .thenThrow(new RuntimeException("Error al actualizar el estado"));

        assertThrows(RuntimeException.class, () -> propertyRepository.updateStatus(propertyId, newStatus));

        verify(feignPropertyRepository, times(1)).updateStatus(propertyId, newStatus);
    }
}