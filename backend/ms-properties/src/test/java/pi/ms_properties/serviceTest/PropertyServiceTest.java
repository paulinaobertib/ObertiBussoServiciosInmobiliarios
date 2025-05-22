package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.Status;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySaveDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.dto.PropertyUpdateDTO;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.impl.PropertyService;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyServiceTest {

    @InjectMocks
    private PropertyService propertyService;

    @Mock
    private IPropertyRepository propertyRepository;

    // casos de exito

    @Test
    void createProperty_success() {
        PropertySaveDTO dto = new PropertySaveDTO();
        when(propertyRepository.save(any(Property.class))).thenReturn(new Property());

        ResponseEntity<String> response = propertyService.createProperty(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha creado correctamente la propiedad", response.getBody());
    }

    @Test
    void deleteProperty_success() {
        Property property = new Property();
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        ResponseEntity<String> response = propertyService.deleteProperty(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado correctamente la propiedad", response.getBody());
        verify(propertyRepository).delete(property);
    }

    @Test
    void updateProperty_success() {
        PropertyUpdateDTO dto = new PropertyUpdateDTO();
        Property property = new Property();

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(propertyRepository.save(any(Property.class))).thenReturn(property);

        ResponseEntity<PropertyDTO> response = propertyService.updateProperty(1L, dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void updateStatus_success() {
        Property property = new Property();
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        ResponseEntity<String> response = propertyService.updateStatus(1L, Status.DISPONIBLE);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha actualizado el estado correctamente", response.getBody());
    }

    @Test
    void getAll_success() {
        when(propertyRepository.findAll()).thenReturn(List.of(new Property(), new Property()));

        ResponseEntity<List<PropertyDTO>> response = propertyService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void getAllUsers_success() {
        when(propertyRepository.findAll()).thenReturn(List.of(new Property(), new Property()));

        ResponseEntity<List<PropertyDTO>> response = propertyService.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void getById_success() {
        Property property = new Property();
        property.setId(1L);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        ResponseEntity<PropertyDTO> response = propertyService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void getByStatus_success() {
        when(propertyRepository.findByStatus(Status.DISPONIBLE)).thenReturn(List.of(new Property()));

        ResponseEntity<List<PropertyDTO>> response = propertyService.getByStatus(Status.DISPONIBLE);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void findBy_success() {
        when(propertyRepository.findAll(any(Specification.class))).thenReturn(List.of(new Property()));
        ResponseEntity<List<PropertyDTO>> response = propertyService.findBy(0, 100000, 0, 300, 0, 100, 3, "venta", "departamento", List.of("pileta"), "Buenos Aires", "Palermo", "URBANO", true, false);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void findByTitleDescription_success() {
        when(propertyRepository.findAll(any(Specification.class))).thenReturn(List.of(new Property()));
        ResponseEntity<List<PropertyDTO>> response = propertyService.findByTitleDescription("hermosa");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getSimpleById_success() {
        Property property = new Property();
        property.setId(1L);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        ResponseEntity<PropertySimpleDTO> response = propertyService.getSimpleById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
    }

    // casos de error

    @Test
    void deleteProperty_notFound() {
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = propertyService.deleteProperty(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateProperty_notFound() {
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<PropertyDTO> response = propertyService.updateProperty(99L, new PropertyUpdateDTO());

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateStatus_notFound() {
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = propertyService.updateStatus(99L, Status.DISPONIBLE);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getById_notFound() {
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<PropertyDTO> response = propertyService.getById(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void findBy_internalError() {
        when(propertyRepository.findAll(any(Specification.class))).thenThrow(RuntimeException.class);
        ResponseEntity<List<PropertyDTO>> response = propertyService.findBy(0, 0, 0, 0, 0, 0, 0, "", "", List.of(), "", "", "", null, null);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void findByTitleDescription_internalError() {
        when(propertyRepository.findAll(any(Specification.class))).thenThrow(RuntimeException.class);
        ResponseEntity<List<PropertyDTO>> response = propertyService.findByTitleDescription("fallo");
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getSimpleById_notFound() {
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<PropertySimpleDTO> response = propertyService.getSimpleById(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}

