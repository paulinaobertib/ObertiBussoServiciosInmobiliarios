package pi.ms_properties.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.UserView;
import pi.ms_properties.repository.IUserViewRepository;
import pi.ms_properties.service.impl.UserViewService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserViewServiceTest {

    @Mock
    private IUserViewRepository userViewRepository;

    @InjectMocks
    private UserViewService userViewService;

    private UserView userView;
    private Property property;

    @BeforeEach
    void setUp() {
        property = new Property();
        property.setId(1L);

        userView = new UserView();
        userView.setUserId("user123");
        userView.setProperty(property);
    }

    // casos de exito

    @Test
    void create_shouldSaveUserView() {
        userViewService.create(userView);
        verify(userViewRepository).save(userView);
    }

    @Test
    void getAll_shouldReturnList() {
        List<UserView> mockList = List.of(userView);
        when(userViewRepository.findAll()).thenReturn(mockList);

        List<UserView> result = userViewService.getAll();

        assertEquals(1, result.size());
        assertEquals("user123", result.getFirst().getUserId());
        verify(userViewRepository).findAll();
    }

    @Test
    void getByUserId_shouldReturnList() {
        when(userViewRepository.findByUserId("user123")).thenReturn(List.of(userView));

        List<UserView> result = userViewService.getByUserId("user123");

        assertEquals(1, result.size());
        assertEquals("user123", result.getFirst().getUserId());
        verify(userViewRepository).findByUserId("user123");
    }

    // casos de error

    @Test
    void create_shouldThrowDataIntegrityViolationException() {
        doThrow(new DataIntegrityViolationException("Duplicado")).when(userViewRepository).save(any());

        assertThrows(DataIntegrityViolationException.class, () ->
            userViewService.create(userView));

        verify(userViewRepository).save(userView);
    }

    @Test
    void create_shouldThrowIllegalArgumentException() {
        doThrow(new IllegalArgumentException("Argumento inválido")).when(userViewRepository).save(any());

        assertThrows(IllegalArgumentException.class, () ->
            userViewService.create(userView));

        verify(userViewRepository).save(userView);
    }

    @Test
    void getAll_shouldThrowRuntimeException() {
        when(userViewRepository.findAll()).thenThrow(new RuntimeException("Error interno"));

        assertThrows(RuntimeException.class, () -> userViewService.getAll());
        verify(userViewRepository).findAll();
    }

    @Test
    void getByUserId_shouldThrowEntityNotFoundException() {
        when(userViewRepository.findByUserId("user123")).thenThrow(new EntityNotFoundException("Usuario no encontrado"));

        assertThrows(EntityNotFoundException.class, () -> userViewService.getByUserId("user123"));
        verify(userViewRepository).findByUserId("user123");
    }
}
