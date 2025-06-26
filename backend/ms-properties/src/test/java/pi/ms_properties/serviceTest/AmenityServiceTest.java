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
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.repository.IAmenityRepository;
import pi.ms_properties.service.impl.AmenityService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
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
    void updateAmenity_shouldReturnAmenity_whenAmenityExists() {
        Amenity amenity = new Amenity(1L, "Pileta", new ArrayList<>());

        when(amenityRepository.existsById(1L)).thenReturn(true);
        when(amenityRepository.save(amenity)).thenReturn(amenity);

        Amenity result = amenityService.updateAmenity(amenity).getBody();

        assertEquals("Pileta", result.getName());
        assertEquals(1L, result.getId());
        verify(amenityRepository).save(amenity);
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
    void createAmenity_shouldThrowIllegalArgumentException_whenNameIsBlank() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> amenityService.createAmenity(" "));
        assertEquals("El nombre no puede estar vacío", ex.getMessage());
        verify(amenityRepository, never()).save(any());
    }

    @Test
    void createAmenity_shouldThrowDataIntegrityViolationException_whenDuplicateName() {
        String name = "WiFi";
        doThrow(new DataIntegrityViolationException("ya existe")).when(amenityRepository).save(any());

        DataIntegrityViolationException ex = assertThrows(DataIntegrityViolationException.class, () -> amenityService.createAmenity(name));

        assertEquals("ya existe", ex.getMessage());
    }

    @Test
    void createAmenity_shouldThrowRuntimeException_whenUnexpectedException() {
        doThrow(new RuntimeException("Fallo inesperado")).when(amenityRepository).save(any());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> amenityService.createAmenity("Parrilla"));

        assertEquals("Fallo inesperado", ex.getMessage());
    }

    @Test
    void deleteAmenity_shouldThrowEntityNotFoundException_whenAmenityDoesNotExist() {
        when(amenityRepository.findById(anyLong())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> amenityService.deleteAmenity(1L));

        assertEquals("No se encontró el servicio con ID 1", ex.getMessage());
        verify(amenityRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteAmenity_shouldThrowRuntimeException_whenExceptionOccurs() {
        when(amenityRepository.findById(anyLong())).thenThrow(new RuntimeException("Error DB"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> amenityService.deleteAmenity(1L));

        assertEquals("Error DB", ex.getMessage());
    }

    @Test
    void updateAmenity_shouldThrowEntityNotFoundException_whenAmenityDoesNotExist() {
        Amenity amenity = new Amenity(1L, "Gimnasio", new ArrayList<>());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> amenityService.updateAmenity(amenity));

        assertEquals("No se encontró el servicio con ID 1", ex.getMessage());
    }

    @Test
    void updateAmenity_shouldThrowRuntimeException_whenExceptionOccurs() {
        Amenity amenity = new Amenity(1L, "Spa", new ArrayList<>());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> amenityService.updateAmenity(amenity));

        assertEquals("No se encontró el servicio con ID 1", ex.getMessage());
    }

    @Test
    void getAll_shouldReturnNoContent_whenNoAmenitiesFound() {
        when(amenityRepository.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<Amenity>> response = amenityService.getAll();

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void getAll_shouldThrowRuntimeException_whenExceptionOccurs() {
        when(amenityRepository.findAll()).thenThrow(new RuntimeException("Falló el findAll"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> amenityService.getAll());

        assertEquals("Falló el findAll", ex.getMessage());
    }

    @Test
    void getById_shouldThrowEntityNotFoundException_whenAmenityDoesNotExist() {
        when(amenityRepository.findById(anyLong())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> amenityService.getById(1L));

        assertEquals("No se encontró el servicio con ID 1", ex.getMessage());
    }

    @Test
    void getById_shouldThrowRuntimeException_whenExceptionOccurs() {
        when(amenityRepository.findById(anyLong())).thenThrow(new RuntimeException("Error inesperado"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> amenityService.getById(1L));

        assertEquals("Error inesperado", ex.getMessage());
    }


    @Test
    void getAll_shouldReturnNoContent_whenEmptyList() {
        when(amenityRepository.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<Amenity>> response = amenityService.getAll();

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

}
