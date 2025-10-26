package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Suggestion;
import pi.ms_properties.repository.ISuggestionRepository;
import pi.ms_properties.service.impl.SuggestionService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SuggestionServiceTest {

    @Mock
    private ISuggestionRepository suggestionRepository;

    @InjectMocks
    private SuggestionService suggestionService;

    // casos de exito

    @Test
    void createSuggestion_shouldReturnOk_whenDescriptionIsValid() {
        String description = "Agregar buscador avanzado";

        ResponseEntity<String> response = suggestionService.createSuggestion(description);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("La sugerencia se creó correctamente.", response.getBody());
        verify(suggestionRepository).save(any(Suggestion.class));
    }

    @Test
    void createSuggestion_shouldSetDescriptionAndDateProperly() {
        String description = "Mejorar diseño visual";

        doAnswer(invocation -> {
            Suggestion saved = invocation.getArgument(0);
            assertEquals(description, saved.getDescription());
            assertNotNull(saved.getDate());
            assertTrue(saved.getDate().isBefore(LocalDateTime.now().plusSeconds(1)));
            return null;
        }).when(suggestionRepository).save(any(Suggestion.class));

        suggestionService.createSuggestion(description);

        verify(suggestionRepository, times(1)).save(any(Suggestion.class));
    }

    @Test
    void getAll_shouldReturnList_whenSuggestionsExist() {
        Suggestion s1 = new Suggestion();
        s1.setId(1L);
        s1.setDescription("Agregar modo oscuro");

        Suggestion s2 = new Suggestion();
        s2.setId(2L);
        s2.setDescription("Permitir subir imágenes");

        when(suggestionRepository.findAll()).thenReturn(Arrays.asList(s1, s2));

        ResponseEntity<List<Suggestion>> response = suggestionService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        assertEquals("Agregar modo oscuro", response.getBody().get(0).getDescription());
        verify(suggestionRepository).findAll();
    }

    @Test
    void getAll_shouldReturnEmptyList_whenNoSuggestionsExist() {
        when(suggestionRepository.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<Suggestion>> response = suggestionService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
        verify(suggestionRepository).findAll();
    }

    // casos de error

    @Test
    void createSuggestion_shouldThrowException_whenRepositoryFails() {
        doThrow(new RuntimeException("Error al guardar")).when(suggestionRepository).save(any(Suggestion.class));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> suggestionService.createSuggestion("Error test"));

        assertEquals("Error al guardar", ex.getMessage());
        verify(suggestionRepository).save(any(Suggestion.class));
    }

    @Test
    void createSuggestion_shouldThrowDataIntegrityViolationException_whenDuplicateEntry() {
        doThrow(new DataIntegrityViolationException("Duplicado")).when(suggestionRepository).save(any(Suggestion.class));

        DataIntegrityViolationException ex = assertThrows(DataIntegrityViolationException.class,
                () -> suggestionService.createSuggestion("Ya existe"));

        assertEquals("Duplicado", ex.getMessage());
        verify(suggestionRepository).save(any(Suggestion.class));
    }

    @Test
    void getAll_shouldThrowRuntimeException_whenRepositoryFails() {
        when(suggestionRepository.findAll()).thenThrow(new RuntimeException("Error DB"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> suggestionService.getAll());

        assertEquals("Error DB", ex.getMessage());
        verify(suggestionRepository).findAll();
    }
}
