package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Owner;
import pi.ms_properties.domain.Property;
import pi.ms_properties.repository.IOwnerRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.impl.OwnerService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OwnerServiceTest {

    @InjectMocks
    private OwnerService ownerService;

    @Mock
    private IOwnerRepository ownerRepository;

    @Mock
    private IPropertyRepository propertyRepository;

    private Owner owner;

    @BeforeEach
    void setUp() {
        owner = new Owner();
        owner.setId(1L);
        owner.setFirstName("John");
        owner.setLastName("Doe");
        owner.setMail("john.doe@mail.com");
        owner.setPhone("123456789");
    }

    // casos de exito

    @Test
    void createOwner_Success() {
        ResponseEntity<String> response = ownerService.createOwner(owner);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Se ha guardado el propietario", response.getBody());
        verify(ownerRepository).save(owner);
    }

    @Test
    void deleteOwner_Success() {
        when(ownerRepository.findById(1L)).thenReturn(Optional.of(owner));

        ResponseEntity<String> response = ownerService.deleteOwner(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(ownerRepository).deleteById(1L);
    }

    @Test
    void updateOwner_Success() {
        when(ownerRepository.findById(owner.getId())).thenReturn(Optional.of(owner));

        ResponseEntity<Owner> response = ownerService.updateOwner(owner);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(owner, response.getBody());
        verify(ownerRepository).save(owner);
    }

    @Test
    void getByPropertyId_Success() {
        Property property = new Property();
        property.setId(1L);
        property.setOwner(owner);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(ownerRepository.findById(owner.getId())).thenReturn(Optional.of(owner));

        ResponseEntity<Owner> response = ownerService.getByPropertyId(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(owner, response.getBody());
    }

    @Test
    void getAll_Success() {
        when(ownerRepository.findAll()).thenReturn(List.of(owner));

        ResponseEntity<List<Owner>> response = ownerService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getById_Success() {
        when(ownerRepository.findById(1L)).thenReturn(Optional.of(owner));

        ResponseEntity<Owner> response = ownerService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(owner, response.getBody());
    }

    @Test
    void findBy_Success() {
        when(ownerRepository.findAll(any(Specification.class))).thenReturn(List.of(owner));

        ResponseEntity<List<Owner>> response = ownerService.findBy("john");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    // casos de error

    @Test
    void createOwner_DuplicateMail_ReturnsBadRequest() {
        doThrow(DataIntegrityViolationException.class).when(ownerRepository).save(owner);

        ResponseEntity<String> response = ownerService.createOwner(owner);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains(owner.getMail()));
    }

    @Test
    void createOwner_InternalServerError() {
        doThrow(new RuntimeException("DB error")).when(ownerRepository).save(owner);

        ResponseEntity<String> response = ownerService.createOwner(owner);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("No se ha podido guardar el propietario"));
    }

    @Test
    void deleteOwner_NotFound() {
        when(ownerRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = ownerService.deleteOwner(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteOwner_InternalServerError() {
        when(ownerRepository.findById(1L)).thenReturn(Optional.of(owner));
        doThrow(new RuntimeException("DB error")).when(ownerRepository).deleteById(1L);

        ResponseEntity<String> response = ownerService.deleteOwner(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("No se ha podido eliminar el propietario"));
    }

    @Test
    void updateOwner_NotFound() {
        when(ownerRepository.findById(owner.getId())).thenReturn(Optional.empty());

        ResponseEntity<Owner> response = ownerService.updateOwner(owner);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateOwner_InternalServerError() {
        when(ownerRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        doThrow(new RuntimeException("DB error")).when(ownerRepository).save(owner);

        ResponseEntity<Owner> response = ownerService.updateOwner(owner);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByPropertyId_PropertyNotFound() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Owner> response = ownerService.getByPropertyId(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getByPropertyId_OwnerNotFound() {
        Property property = new Property();
        property.setId(1L);
        property.setOwner(owner);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(ownerRepository.findById(owner.getId())).thenReturn(Optional.empty());

        ResponseEntity<Owner> response = ownerService.getByPropertyId(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getByPropertyId_InternalServerError() {
        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected error"));

        ResponseEntity<Owner> response = ownerService.getByPropertyId(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getAll_Empty_ReturnsNoContent() {
        when(ownerRepository.findAll()).thenReturn(List.of());

        ResponseEntity<List<Owner>> response = ownerService.getAll();

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void getAll_InternalServerError() {
        when(ownerRepository.findAll()).thenThrow(new RuntimeException("Unexpected error"));

        ResponseEntity<List<Owner>> response = ownerService.getAll();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getById_NotFound() {
        when(ownerRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Owner> response = ownerService.getById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getById_InternalServerError() {
        when(ownerRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected error"));

        ResponseEntity<Owner> response = ownerService.getById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void findBy_InternalServerError() {
        when(ownerRepository.findAll(any(Specification.class)))
                .thenThrow(new RuntimeException("Unexpected error"));

        ResponseEntity<List<Owner>> response = ownerService.findBy("error");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}

