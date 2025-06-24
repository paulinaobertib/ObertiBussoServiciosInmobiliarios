package pi.ms_properties.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Owner;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.feign.ContractDTO;
import pi.ms_properties.repository.IOwnerRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.ContractRepository;
import pi.ms_properties.service.impl.OwnerService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
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

    @Mock
    private ContractRepository contractRepository;

    private Owner owner;

    private Property property1;

    private Property property2;

    private ContractDTO contract1;

    private ContractDTO contract2;

    @BeforeEach
    void setUp() {
        owner = new Owner();
        owner.setId(1L);
        owner.setFirstName("John");
        owner.setLastName("Doe");
        owner.setEmail("john.doe@email.com");
        owner.setPhone("123456789");

        property1 = new Property();
        property1.setId(10L);

        property2 = new Property();
        property2.setId(20L);

        contract1 = new ContractDTO();
        contract2 = new ContractDTO();
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

    @Test
    void findContracts_Success() {
        when(ownerRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(propertyRepository.findByOwner(owner.getId())).thenReturn(List.of(property1, property2));
        when(contractRepository.findByPropertyId(property1.getId())).thenReturn(List.of(contract1));
        when(contractRepository.findByPropertyId(property2.getId())).thenReturn(List.of(contract2));

        ResponseEntity<List<ContractDTO>> response = ownerService.findContracts(owner.getId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertTrue(response.getBody().contains(contract1));
        assertTrue(response.getBody().contains(contract2));
    }

    // casos de error

    @Test
    void getAll_Empty_ReturnsNoContent() {
        when(ownerRepository.findAll()).thenReturn(List.of());

        ResponseEntity<List<Owner>> response = ownerService.getAll();

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void createOwner_DuplicateMail_throwsDataIntegrityViolationException() {
        doThrow(IllegalArgumentException.class).when(ownerRepository).save(owner);

        assertThrows(IllegalArgumentException.class, () ->
                ownerService.createOwner(owner)
        );
    }

    @Test
    void createOwner_InternalServerError_throwsRuntimeException() {
        doThrow(new RuntimeException("DB error")).when(ownerRepository).save(owner);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ownerService.createOwner(owner)
        );

        assertEquals("DB error", ex.getMessage());
    }

    @Test
    void deleteOwner_NotFound_throwsEntityNotFoundException() {
        when(ownerRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
                ownerService.deleteOwner(1L)
        );

        assertEquals("No existe el propietario con ID: 1", ex.getMessage());
    }

    @Test
    void deleteOwner_InternalServerError_throwsRuntimeException() {
        when(ownerRepository.findById(1L)).thenReturn(Optional.of(owner));
        doThrow(new RuntimeException("DB error")).when(ownerRepository).deleteById(1L);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ownerService.deleteOwner(1L)
        );

        assertEquals("DB error", ex.getMessage());
    }

    @Test
    void updateOwner_NotFound_throwsEntityNotFoundException() {
        when(ownerRepository.findById(owner.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
                ownerService.updateOwner(owner)
        );

        assertEquals("No existe el propietario con ID: 1", ex.getMessage());
    }

    @Test
    void updateOwner_InternalServerError_throwsRuntimeException() {
        when(ownerRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        doThrow(new RuntimeException("DB error")).when(ownerRepository).save(owner);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ownerService.updateOwner(owner)
        );

        assertEquals("DB error", ex.getMessage());
    }

    @Test
    void getByPropertyId_PropertyNotFound_throwsEntityNotFoundException() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
                ownerService.getByPropertyId(1L)
        );

        assertEquals("No existe la propiedad con ID: 1", ex.getMessage());
    }

    @Test
    void getByPropertyId_OwnerNotFound_throwsEntityNotFoundException() {
        Property property = new Property();
        property.setId(1L);
        property.setOwner(owner);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(ownerRepository.findById(owner.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
                ownerService.getByPropertyId(1L)
        );

        assertEquals("No se encontró el propietario para la propiedad", ex.getMessage());
    }

    @Test
    void getByPropertyId_InternalServerError_throwsRuntimeException() {
        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ownerService.getByPropertyId(1L)
        );

        assertEquals("Unexpected error", ex.getMessage());
    }

    @Test
    void getAll_InternalServerError_throwsRuntimeException() {
        when(ownerRepository.findAll()).thenThrow(new RuntimeException("Unexpected error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ownerService.getAll()
        );

        assertEquals("Unexpected error", ex.getMessage());
    }

    @Test
    void getById_NotFound_throwsEntityNotFoundException() {
        when(ownerRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
                ownerService.getById(1L)
        );

        assertEquals("No existe el propietario con ID: 1", ex.getMessage());
    }

    @Test
    void getById_InternalServerError_throwsRuntimeException() {
        when(ownerRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ownerService.getById(1L)
        );

        assertEquals("Unexpected error", ex.getMessage());
    }

    @Test
    void findBy_InternalServerError_throwsRuntimeException() {
        when(ownerRepository.findAll(any(Specification.class)))
                .thenThrow(new RuntimeException("Unexpected error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ownerService.findBy("error")
        );

        assertEquals("Unexpected error", ex.getMessage());
    }

    @Test
    void findContracts_OwnerNotFound() {
        when(ownerRepository.findById(999L)).thenReturn(Optional.empty());

        EntityNotFoundException thrown = assertThrows(EntityNotFoundException.class,
                () -> ownerService.findContracts(999L));

        assertEquals("No se ha encontrado al propietario con ID: 999", thrown.getMessage());
    }
}

