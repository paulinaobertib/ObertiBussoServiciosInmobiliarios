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
import pi.ms_users.domain.IncreaseIndex;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IIncreaseIndexRepository;
import pi.ms_users.service.impl.IncreaseIndexService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncreaseIndexServiceTest {

    @Mock
    private IIncreaseIndexRepository increaseIndexRepository;

    @Mock
    private IContractRepository contractRepository;

    @InjectMocks
    private IncreaseIndexService service;

    private IncreaseIndex index;

    @BeforeEach
    void setUp() {
        index = new IncreaseIndex();
        index.setId(1L);
        index.setCode("IPC");
        index.setName("Índice de Precios");
    }

    // casos de exito

    @Test
    void create_success() {
        when(increaseIndexRepository.findByCode("IPC")).thenReturn(Optional.empty());

        ResponseEntity<String> response = service.create(index);

        assertEquals("Se ha creado el indice de aumento: Índice de Precios", response.getBody());
        verify(increaseIndexRepository).save(index);
    }

    @Test
    void update_success() {
        when(increaseIndexRepository.findById(1L)).thenReturn(Optional.of(index));

        IncreaseIndex updated = new IncreaseIndex();
        updated.setId(1L);
        updated.setCode("NEW");
        updated.setName("Nuevo Índice");

        ResponseEntity<String> response = service.update(updated);

        assertEquals("Se ha actualizado el indice de aumento.", response.getBody());
        verify(increaseIndexRepository).save(any(IncreaseIndex.class));
    }

    @Test
    void delete_success() {
        when(increaseIndexRepository.findById(1L)).thenReturn(Optional.of(index));
        when(increaseIndexRepository.existsByAdjustmentIndexId(1L)).thenReturn(false);

        ResponseEntity<String> response = service.delete(1L);

        assertEquals("Se ha eliminado el indice de aumento.", response.getBody());
        verify(increaseIndexRepository).delete(index);
    }

    @Test
    void getById_success() {
        when(increaseIndexRepository.findById(1L)).thenReturn(Optional.of(index));

        ResponseEntity<IncreaseIndex> response = service.getById(1L);

        assertEquals(index, response.getBody());
    }

    @Test
    void getAll_success() {
        when(increaseIndexRepository.findAll()).thenReturn(List.of(index));

        ResponseEntity<List<IncreaseIndex>> response = service.getAll();

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByName_success() {
        when(increaseIndexRepository.findByName("Índice de Precios")).thenReturn(Optional.of(index));

        ResponseEntity<IncreaseIndex> response = service.getByName("Índice de Precios");

        assertEquals(index, response.getBody());
    }

    @Test
    void getByCode_success() {
        when(increaseIndexRepository.findByCode("IPC")).thenReturn(Optional.of(index));

        ResponseEntity<IncreaseIndex> response = service.getByCode("IPC");

        assertEquals(index, response.getBody());
    }

    @Test
    void getContractsByIncreaseIndex_success() {
        Contract contract = new Contract();
        contract.setId(10L);
        contract.setUserId("user123");
        contract.setPropertyId(20L);

        when(increaseIndexRepository.findContractsByIncreaseIndexId(1L)).thenReturn(List.of(contract));

        ResponseEntity<List<ContractSimpleDTO>> response = service.getContractsByIncreaseIndex(1L);

        assertEquals(1, response.getBody().size());
        assertEquals(10L, response.getBody().getFirst().getId());
    }

    @Test
    void getByContract_success() {
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(increaseIndexRepository.findByContractId(10L)).thenReturn(index);

        ResponseEntity<IncreaseIndex> response = service.getByContract(10L);

        assertEquals(index, response.getBody());
    }

    // casos de error

    @Test
    void create_duplicateCode_throws() {
        when(increaseIndexRepository.findByCode("IPC")).thenReturn(Optional.of(index));

        assertThrows(IllegalArgumentException.class, () -> service.create(index));
    }

    @Test
    void update_notFound_throws() {
        when(increaseIndexRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.update(index));
    }

    @Test
    void delete_notFound_throws() {
        when(increaseIndexRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.delete(1L));
    }

    @Test
    void delete_inUse_returnsBadRequest() {
        when(increaseIndexRepository.findById(1L)).thenReturn(Optional.of(index));
        when(increaseIndexRepository.existsByAdjustmentIndexId(1L)).thenReturn(true);

        ResponseEntity<String> response = service.delete(1L);

        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().contains("No se pueden eliminar"));
    }

    @Test
    void getById_notFound_throws() {
        when(increaseIndexRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void getByName_notFound_throws() {
        when(increaseIndexRepository.findByName("X")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getByName("X"));
    }

    @Test
    void getByCode_notFound_throws() {
        when(increaseIndexRepository.findByCode("X")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getByCode("X"));
    }

    @Test
    void getByContract_notFoundContract_throws() {
        when(contractRepository.existsById(10L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.getByContract(10L));
    }
}
