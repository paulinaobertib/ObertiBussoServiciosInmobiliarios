package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.repository.IAmenityRepository;
import pi.ms_properties.service.impl.AmenityService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AmenityServiceTest {

    @Mock
    private IAmenityRepository amenityRepository;

    @InjectMocks
    private AmenityService amenityService;

    // casos de exito

    @Test
    void createAmenity_shouldReturnOk_whenNameIsValid() {
        String name = "WiFi";

        ResponseEntity<String> response = amenityService.createAmenity(name);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha guardado correctamente el servicio", response.getBody());
        verify(amenityRepository).save(any(Amenity.class));
    }

    @Test
    void deleteAmenity_shouldReturnOk_whenAmenityExists() {
        Long id = 1L;
        when(amenityRepository.findById(id)).thenReturn(Optional.of(new Amenity()));

        ResponseEntity<String> response = amenityService.deleteAmenity(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado el servicio correctamente", response.getBody());
        verify(amenityRepository).deleteById(id);
    }

    @Test
    void updateAmenity_shouldReturnOk_whenAmenityExists() {
        Amenity amenity = new Amenity(1L, "Pileta", new ArrayList<>());
        when(amenityRepository.findById(amenity.getId())).thenReturn(Optional.of(amenity));
        when(amenityRepository.save(amenity)).thenReturn(amenity);

        ResponseEntity<Amenity> response = amenityService.updateAmenity(amenity);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(amenity, response.getBody());
    }

    @Test
    void getAll_shouldReturnList_whenAmenitiesExist() {
        List<Amenity> amenities = List.of(new Amenity(1L, "Wifi", new ArrayList<>()));
        when(amenityRepository.findAll()).thenReturn(amenities);

        ResponseEntity<List<Amenity>> response = amenityService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getById_shouldReturnAmenity_whenExists() {
        Amenity amenity = new Amenity(1L, "Estacionamiento", new ArrayList<>());
        when(amenityRepository.findById(1L)).thenReturn(Optional.of(amenity));

        ResponseEntity<Amenity> response = amenityService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(amenity, response.getBody());
    }

    // casos de error

    @Test
    void createAmenity_shouldReturnBadRequest_whenNameIsBlank() {
        ResponseEntity<String> response = amenityService.createAmenity(" ");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("El nombre no puede estar vacío", response.getBody());
        verify(amenityRepository, never()).save(any());
    }

    @Test
    void createAmenity_shouldReturnBadRequest_whenDataIntegrityViolation() {
        String name = "WiFi";
        doThrow(DataIntegrityViolationException.class).when(amenityRepository).save(any());

        ResponseEntity<String> response = amenityService.createAmenity(name);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("ya existe"));
    }

    @Test
    void createAmenity_shouldReturnInternalServerError_whenUnexpectedException() {
        doThrow(RuntimeException.class).when(amenityRepository).save(any());

        ResponseEntity<String> response = amenityService.createAmenity("Parrilla");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("No se ha podido guardar"));
    }

    @Test
    void deleteAmenity_shouldReturnNotFound_whenAmenityDoesNotExist() {
        when(amenityRepository.findById(anyLong())).thenReturn(Optional.empty());

        ResponseEntity<String> response = amenityService.deleteAmenity(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(amenityRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteAmenity_shouldReturnInternalServerError_whenExceptionOccurs() {
        when(amenityRepository.findById(anyLong())).thenThrow(RuntimeException.class);

        ResponseEntity<String> response = amenityService.deleteAmenity(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("No se ha podido eliminar"));
    }

    @Test
    void updateAmenity_shouldReturnNotFound_whenAmenityDoesNotExist() {
        Amenity amenity = new Amenity(1L, "Gimnasio", new ArrayList<>());
        when(amenityRepository.findById(anyLong())).thenReturn(Optional.empty());

        ResponseEntity<Amenity> response = amenityService.updateAmenity(amenity);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateAmenity_shouldReturnInternalServerError_whenExceptionOccurs() {
        Amenity amenity = new Amenity(1L, "Spa", new ArrayList<>());
        when(amenityRepository.findById(anyLong())).thenThrow(RuntimeException.class);

        ResponseEntity<Amenity> response = amenityService.updateAmenity(amenity);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getAll_shouldReturnNoContent_whenEmptyList() {
        when(amenityRepository.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<Amenity>> response = amenityService.getAll();

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void getAll_shouldReturnInternalServerError_whenExceptionOccurs() {
        when(amenityRepository.findAll()).thenThrow(RuntimeException.class);

        ResponseEntity<List<Amenity>> response = amenityService.getAll();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnNotFound_whenAmenityDoesNotExist() {
        when(amenityRepository.findById(anyLong())).thenReturn(Optional.empty());

        ResponseEntity<Amenity> response = amenityService.getById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnInternalServerError_whenExceptionOccurs() {
        when(amenityRepository.findById(anyLong())).thenThrow(RuntimeException.class);

        ResponseEntity<Amenity> response = amenityService.getById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}
