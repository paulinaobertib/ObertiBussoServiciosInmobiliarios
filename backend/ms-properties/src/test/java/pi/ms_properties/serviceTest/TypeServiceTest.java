package pi.ms_properties.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Type;
import pi.ms_properties.repository.ITypeRepository;
import pi.ms_properties.service.impl.TypeService;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TypeServiceTest {

    @InjectMocks
    private TypeService typeService;

    @Mock
    private ITypeRepository typeRepository;

    // casos de exito

    @Test
    void createType_success() {
        Type type = new Type();
        type.setName("Casa");

        when(typeRepository.save(type)).thenReturn(type);

        ResponseEntity<String> response = typeService.createType(type);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha guardado el tipo de propiedad", response.getBody());
        verify(typeRepository).save(type);
    }

    @Test
    void deleteType_success() {
        Type type = new Type();
        type.setId(1L);

        when(typeRepository.findById(1L)).thenReturn(Optional.of(type));
        doNothing().when(typeRepository).delete(type);

        ResponseEntity<String> response = typeService.deleteType(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado el tipo de propiedad", response.getBody());
        verify(typeRepository).delete(type);
    }

    @Test
    void updateType_success() {
        Type type = new Type();
        type.setId(1L);
        type.setName("Departamento");

        when(typeRepository.findById(1L)).thenReturn(Optional.of(type));
        when(typeRepository.save(type)).thenReturn(type);

        ResponseEntity<Type> response = typeService.updateType(type);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(type, response.getBody());
        verify(typeRepository).save(type);
    }

    @Test
    void getAll_success() {
        Type type = new Type();
        type.setId(1L);
        type.setName("Local");

        when(typeRepository.findAll()).thenReturn(List.of(type));

        ResponseEntity<List<Type>> response = typeService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isEmpty());
        assertEquals(type.getName(), response.getBody().getFirst().getName());
    }

    @Test
    void getById_success() {
        Type type = new Type();
        type.setId(1L);
        type.setName("Terreno");

        when(typeRepository.findById(1L)).thenReturn(Optional.of(type));

        ResponseEntity<Type> response = typeService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(type, response.getBody());
    }

    @Test
    void getAll_noContent() {
        when(typeRepository.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<Type>> response = typeService.getAll();

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    // casos de error

    @Test
    void createType_dataIntegrityViolation() {
        Type type = new Type();
        type.setName("Casa");

        doThrow(new DataIntegrityViolationException("")).when(typeRepository).save(type);

        DataIntegrityViolationException exception = assertThrows(DataIntegrityViolationException.class, () -> {
            typeService.createType(type);
        });
        assertTrue(true);
    }

    @Test
    void createType_generalException() {
        Type type = new Type();
        type.setName("Casa");

        doThrow(new RuntimeException("Error!")).when(typeRepository).save(type);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            typeService.createType(type);
        });

        assertTrue(exception.getMessage().contains("Error!"));
    }

    @Test
    void deleteType_notFound() {
        when(typeRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            typeService.deleteType(1L);
        });

        assertEquals("No existe ese tipo de propiedad", exception.getMessage());
    }

    @Test
    void deleteType_generalException() {
        Type type = new Type();
        type.setId(1L);

        when(typeRepository.findById(1L)).thenReturn(Optional.of(type));
        doThrow(new RuntimeException("Error!")).when(typeRepository).delete(type);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            typeService.deleteType(1L);
        });

        assertTrue(exception.getMessage().contains("Error!"));
    }

    @Test
    void updateType_notFound() {
        Type type = new Type();
        type.setId(1L);

        when(typeRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            typeService.updateType(type);
        });
    }

    @Test
    void updateType_generalException() {
        Type type = new Type();
        type.setId(1L);

        when(typeRepository.findById(1L)).thenReturn(Optional.of(type));
        doThrow(new RuntimeException("Error!")).when(typeRepository).save(type);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            typeService.updateType(type);
        });

        assertTrue(exception.getMessage().contains("Error!"));
    }

    @Test
    void getById_generalException() {
        when(typeRepository.findById(1L)).thenThrow(new RuntimeException("Error!"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            typeService.getById(1L);
        });

        assertTrue(exception.getMessage().contains("Error!"));
    }

    @Test
    void getAll_generalException() {
        when(typeRepository.findAll()).thenThrow(new RuntimeException("Error!"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            typeService.getAll();
        });

        assertTrue(exception.getMessage().contains("Error!"));
    }
}
