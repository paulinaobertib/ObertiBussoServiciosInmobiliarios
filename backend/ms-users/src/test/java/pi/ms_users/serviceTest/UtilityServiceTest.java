package pi.ms_users.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.Utility;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.UtilityDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IUtilityRepository;
import pi.ms_users.service.impl.UtilityService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UtilityServiceTest {

    @Mock private IUtilityRepository utilityRepository;
    @Mock private IContractRepository contractRepository;

    @InjectMocks
    private UtilityService service;

    private Utility entity;
    private UtilityDTO dto;

    @BeforeEach
    void setUp() {
        entity = new Utility();
        entity.setId(1L);
        entity.setName("Luz");

        dto = new UtilityDTO();
        dto.setId(1L);
        dto.setName("Luz");
    }

    // casos de exito

    @Test
    void create_success() {
        when(utilityRepository.findByName("Luz")).thenReturn(Optional.empty());

        ResponseEntity<String> response = service.create(dto);

        assertEquals("Se ha creado el servicio.", response.getBody());
        verify(utilityRepository).save(any(Utility.class));
    }

    @Test
    void update_success() {
        when(utilityRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<String> response = service.update(dto);

        assertEquals("Se ha actualizado el servicio.", response.getBody());
        verify(utilityRepository).save(entity);
    }

    @Test
    void delete_success() {
        when(utilityRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(utilityRepository.existsByUtilitiesId(1L)).thenReturn(false);

        ResponseEntity<String> response = service.delete(1L);

        assertEquals("Se ha eliminado el servicio.", response.getBody());
        verify(utilityRepository).delete(entity);
    }


    @Test
    void getById_success() {
        when(utilityRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<UtilityDTO> response = service.getById(1L);

        assertEquals("Luz", response.getBody().getName());
    }

    @Test
    void getAll_success() {
        when(utilityRepository.findAll()).thenReturn(List.of(entity));

        ResponseEntity<List<UtilityDTO>> response = service.getAll();

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByName_success() {
        when(utilityRepository.findByName("Luz")).thenReturn(Optional.of(entity));

        ResponseEntity<UtilityDTO> response = service.getByName("Luz");

        assertEquals("Luz", response.getBody().getName());
    }

    @Test
    void getContractsByUtility_success() {
        when(utilityRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(utilityRepository.findAllContractsByUtilityId(1L)).thenReturn(List.of(new Contract()));

        ResponseEntity<List<ContractSimpleDTO>> response = service.getContractsByUtility(1L);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByContract_success() {
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(utilityRepository.findAllByContractId(10L)).thenReturn(List.of(entity));

        ResponseEntity<List<UtilityDTO>> response = service.getByContract(10L);

        assertEquals(1, response.getBody().size());
    }

    // casos de error

    @Test
    void create_duplicateName_throws() {
        when(utilityRepository.findByName("Luz")).thenReturn(Optional.of(entity));
        assertThrows(IllegalArgumentException.class, () -> service.create(dto));
    }

    @Test
    void update_notFound_throws() {
        when(utilityRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void delete_notFound_throws() {
        when(utilityRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.delete(1L));
    }

    @Test
    void delete_inUse_returnsBadRequest() {
        when(utilityRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(utilityRepository.existsByUtilitiesId(1L)).thenReturn(true);

        ResponseEntity<String> response = service.delete(1L);

        assertTrue(response.getBody().contains("No se pueden eliminar"));
    }

    @Test
    void getById_notFound_throws() {
        when(utilityRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void getByName_notFound_throws() {
        when(utilityRepository.findByName("agua")).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getByName("agua"));
    }

    @Test
    void getContractsByUtility_notFound_throws() {
        when(utilityRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getContractsByUtility(1L));
    }

    @Test
    void getByContract_notFound_throws() {
        when(contractRepository.existsById(10L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.getByContract(10L));
    }
}