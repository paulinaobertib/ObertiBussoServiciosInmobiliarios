package pi.ms_properties.serviceTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Neighborhood;
import pi.ms_properties.domain.NeighborhoodType;
import pi.ms_properties.dto.NeighborhoodDTO;
import pi.ms_properties.repository.INeighborhoodRepository;
import pi.ms_properties.service.impl.NeighborhoodService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NeighborhoodServiceTest {

    @InjectMocks
    private NeighborhoodService service;

    @Mock
    private INeighborhoodRepository repository;

    @Mock
    private ObjectMapper mapper;

    // casos de exito

    @Test
    void createNeighborhood_success() {
        NeighborhoodDTO dto = new NeighborhoodDTO(null, "Barrio Norte", "CERRADO", "CABA");
        Neighborhood entity = new Neighborhood(1L, "Barrio Norte", NeighborhoodType.CERRADO, "CABA");

        ResponseEntity<String> response = service.createNeighborhood(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha guardado el barrio", response.getBody());
        verify(repository).save(any(Neighborhood.class));
    }

    @Test
    void deleteNeighborhood_success() {
        Neighborhood neighborhood = new Neighborhood(1L, "Sur", NeighborhoodType.ABIERTO, "Córdoba");

        when(repository.findById(1L)).thenReturn(Optional.of(neighborhood));

        ResponseEntity<String> response = service.deleteNeighborhood(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado el barrio", response.getBody());
        verify(repository).deleteById(1L);
    }

    @Test
    void updateNeighborhood_success() {
        NeighborhoodDTO dto = new NeighborhoodDTO(null, "Palermo", "ABIERTO", "CABA");
        Neighborhood old = new Neighborhood(1L, "Viejo", NeighborhoodType.CERRADO, "La Plata");
        Neighborhood updated = new Neighborhood(1L, "Palermo", NeighborhoodType.ABIERTO, "CABA");

        when(repository.findById(1L)).thenReturn(Optional.of(old));
        when(repository.save(any())).thenReturn(updated);
        when(mapper.convertValue(any(), eq(NeighborhoodDTO.class)))
                .thenReturn(new NeighborhoodDTO(1L, "Palermo", "ABIERTO", "CABA"));

        ResponseEntity<NeighborhoodDTO> response = service.updateNeighborhood(1L, dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Palermo", response.getBody().getName());
    }

    @Test
    void getAll_success() {
        List<Neighborhood> entities = List.of(
                new Neighborhood(1L, "Centro", NeighborhoodType.CERRADO, "Rosario")
        );
        when(repository.findAll()).thenReturn(entities);

        ResponseEntity<List<NeighborhoodDTO>> response = service.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Centro", response.getBody().getFirst().getName());
    }

    @Test
    void getById_success() {
        Neighborhood entity = new Neighborhood(1L, "Sur", NeighborhoodType.SEMICERRADO, "Mendoza");
        NeighborhoodDTO dto = new NeighborhoodDTO(1L, "Sur", "SEMICERRADO", "Mendoza");

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(mapper.convertValue(entity, NeighborhoodDTO.class)).thenReturn(dto);

        ResponseEntity<NeighborhoodDTO> response = service.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Sur", response.getBody().getName());
    }

    // casos de error

    @Test
    void createNeighborhood_duplicateName() {
        NeighborhoodDTO dto = new NeighborhoodDTO(null, "Norte", "CERRADO", "CABA");

        doThrow(DataIntegrityViolationException.class).when(repository).save(any());

        ResponseEntity<String> response = service.createNeighborhood(dto);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("ya existe"));
    }

    @Test
    void deleteNeighborhood_notFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = service.deleteNeighborhood(99L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("No existe el barrio", response.getBody());
    }

    @Test
    void updateNeighborhood_notFound() {
        NeighborhoodDTO dto = new NeighborhoodDTO(null, "Nuevo", "CERRADO", "CABA");

        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<NeighborhoodDTO> response = service.updateNeighborhood(99L, dto);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getAll_noContent() {
        when(repository.findAll()).thenReturn(List.of());

        ResponseEntity<List<NeighborhoodDTO>> response = service.getAll();

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void getById_notFound() {
        when(repository.findById(123L)).thenReturn(Optional.empty());

        ResponseEntity<NeighborhoodDTO> response = service.getById(123L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}

