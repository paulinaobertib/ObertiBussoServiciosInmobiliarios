package pi.ms_users.serviceTest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractIncrease;
import pi.ms_users.domain.Guarantor;
import pi.ms_users.domain.Payment;
import pi.ms_users.dto.ContractGuarantorGetDTO;
import pi.ms_users.dto.GuarantorDTO;
import pi.ms_users.dto.GuarantorGetDTO;
import pi.ms_users.repository.IGuarantorRepository;
import pi.ms_users.service.impl.GuarantorService;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GuarantorServiceTest {

    @Mock
    private IGuarantorRepository guarantorRepository;

    @Mock
    private EntityManager em;

    @InjectMocks
    private GuarantorService service;

    private Guarantor entity;
    private GuarantorDTO dto;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "em", em);

        entity = new Guarantor();
        entity.setId(1L);
        entity.setName("Juan");
        entity.setPhone("123");
        entity.setEmail("juan@test.com");

        dto = new GuarantorDTO();
        dto.setId(1L);
        dto.setName("Juan");
        dto.setPhone("123");
        dto.setEmail("juan@test.com");
    }

    // casos de exito

    @Test
    void create_success() {
        dto.setId(null);
        when(guarantorRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(guarantorRepository.findByPhone(any())).thenReturn(Optional.empty());

        ResponseEntity<String> response = service.create(dto);

        assertEquals(201, response.getStatusCode().value());
        assertEquals("Se ha guardado el garante.", response.getBody());
        verify(guarantorRepository).save(any(Guarantor.class));
    }

    @Test
    void update_success() {
        when(guarantorRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(guarantorRepository.findByEmail(any())).thenReturn(Optional.of(entity));
        when(guarantorRepository.findByPhone(any())).thenReturn(Optional.of(entity));

        ResponseEntity<String> response = service.update(dto);

        assertEquals("Garante actualizado", response.getBody());
        verify(guarantorRepository).save(any(Guarantor.class));
    }

    @Test
    void delete_success() {
        when(guarantorRepository.findByIdWithContracts(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<String> response = service.delete(1L);

        assertEquals("Garante eliminado", response.getBody());
        verify(guarantorRepository).deleteById(1L);
    }

    @Test
    void delete_conflict() {
        Contract contract = new Contract();
        entity.setContracts(Set.of(contract));
        when(guarantorRepository.findByIdWithContracts(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<String> response = service.delete(1L);

        assertEquals(409, response.getStatusCode().value());
        assertTrue(response.getBody().contains("No se puede eliminar"));
        verify(guarantorRepository, never()).deleteById(any());
    }

    @Test
    void getById_success() {
        when(guarantorRepository.findByIdWithContracts(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<GuarantorGetDTO> response = service.getById(1L);

        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getAll_success() {
        when(guarantorRepository.findAll()).thenReturn(List.of(entity));

        ResponseEntity<List<GuarantorGetDTO>> response = service.getAll();

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByContract_success() {
        when(guarantorRepository.findByContractId(10L)).thenReturn(List.of(entity));

        ResponseEntity<List<GuarantorGetDTO>> response = service.getByContract(10L);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getContractsByGuarantor_success() {
        Contract contract = new Contract();
        contract.setId(10L);
        when(guarantorRepository.findByGuarantorId(1L)).thenReturn(List.of(contract));

        ResponseEntity<List<ContractGuarantorGetDTO>> response = service.getContractsByGuarantor(1L);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByEmail_success() {
        when(guarantorRepository.findByEmail("juan@test.com")).thenReturn(Optional.of(entity));

        ResponseEntity<GuarantorGetDTO> response = service.getByEmail("juan@test.com");

        assertEquals("Juan", response.getBody().getName());
    }

    @Test
    void getByPhone_success() {
        when(guarantorRepository.findByPhone("123")).thenReturn(Optional.of(entity));

        ResponseEntity<GuarantorGetDTO> response = service.getByPhone("123");

        assertEquals("Juan", response.getBody().getName());
    }

    @Test
    void addGuarantorToContract_success() {
        Contract contract = new Contract();
        contract.setGuarantors(new HashSet<>());

        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(Guarantor.class, 1L)).thenReturn(entity);

        ResponseEntity<String> response = service.addGuarantorToContract(1L, 10L);

        assertEquals("Vinculado", response.getBody());
    }

    @Test
    void removeGuarantorFromContract_success() {
        Contract contract = new Contract();
        contract.setGuarantors(new HashSet<>(Set.of(entity)));

        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(Guarantor.class, 1L)).thenReturn(entity);

        ResponseEntity<String> response = service.removeGuarantorFromContract(1L, 10L);

        assertEquals("Desvinculado", response.getBody());
    }

    @Test
    void search_success() {
        when(guarantorRepository.findAll(any(Specification.class)))
                .thenReturn(List.of(entity));

        ResponseEntity<List<GuarantorGetDTO>> response = service.search("Juan");

        assertEquals(1, response.getBody().size());
    }

    @Test
    void toGetDTO_null_returnsNull() {
        assertNull(service.toGetDTO(null));
    }

    @Test
    void toEntity_null_returnsNull() {
        assertNull(service.toEntity(null));
    }

    @Test
    void mapContractGuarantor_null_returnsNull() {
        Contract result = null;
        ContractGuarantorGetDTO dto = ReflectionTestUtils.invokeMethod(service, "mapContractGuarantor", result);
        assertNull(dto);
    }

    @Test
    void mapCommission_null_returnsNull() {
        var result = ReflectionTestUtils.invokeMethod(service, "mapCommission", (Object) null);
        assertNull(result);
    }

    @Test
    void addGuarantorToContract_alreadyLinked() {
        Contract contract = new Contract();
        contract.setGuarantors(new HashSet<>(Set.of(entity)));

        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(Guarantor.class, 1L)).thenReturn(entity);

        ResponseEntity<String> response = service.addGuarantorToContract(1L, 10L);

        assertEquals("Ya estaba vinculado", response.getBody());
    }

    @Test
    void mapContractIncrease_mapsFields() {
        ContractIncrease ci = new ContractIncrease();
        ci.setId(5L);
        ci.setNote("nota");
        var dto = ReflectionTestUtils.invokeMethod(service, "mapContractIncrease", ci);
        assertEquals(5L, ((pi.ms_users.dto.ContractIncreaseContractDTO) dto).getId());
    }

    @Test
    void mapPayment_mapsFields() {
        Payment p = new Payment();
        p.setId(7L);
        var dto = ReflectionTestUtils.invokeMethod(service, "mapPayment", p);
        assertEquals(7L, ((pi.ms_users.dto.PaymentContractDTO) dto).getId());
    }

    @Test
    void mapContractGuarantor_withFullEntity_success() {
        Contract c = new Contract();
        c.setId(10L);
        c.setUserId("u1");
        c.setPropertyId(20L);
        c.setContractUtilities(Set.of(new pi.ms_users.domain.ContractUtility()));
        c.setContractIncrease(Set.of(new ContractIncrease()));
        c.setCommission(new pi.ms_users.domain.Commission());
        c.setPayments(Set.of(new Payment()));

        var dto = ReflectionTestUtils.invokeMethod(service, "mapContractGuarantor", c);

        assertNotNull(dto);
        assertEquals(10L, ((ContractGuarantorGetDTO) dto).getId());
    }

    @Test
    void toEntity_mapsFields() {
        GuarantorDTO d = new GuarantorDTO();
        d.setId(5L);
        d.setName("Ana");
        d.setPhone("555");
        d.setEmail("ana@mail.com");

        Guarantor g = service.toEntity(d);

        assertEquals("Ana", g.getName());
        assertEquals("555", g.getPhone());
    }

    @Test
    void toGetDTO_withContracts_success() {
        entity.setContracts(Set.of(new Contract()));
        GuarantorGetDTO dto = service.toGetDTO(entity);
        assertFalse(dto.getContractGetDTOS().isEmpty());
    }

    // casos de error

    @Test
    void create_nullBody_throws() {
        assertThrows(BadRequestException.class, () -> service.create(null));
    }

    @Test
    void create_duplicateEmail_throws() {
        dto.setId(null);
        when(guarantorRepository.findByEmail("juan@test.com")).thenReturn(Optional.of(entity));

        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_duplicatePhone_throws() {
        dto.setId(null);
        when(guarantorRepository.findByPhone("123")).thenReturn(Optional.of(entity));

        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void update_nullId_throws() {
        dto.setId(null);

        assertThrows(BadRequestException.class, () -> service.update(dto));
    }

    @Test
    void update_notFound_throws() {
        when(guarantorRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void delete_notFound_throws() {
        when(guarantorRepository.findByIdWithContracts(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.delete(1L));
    }

    @Test
    void getById_notFound_throws() {
        when(guarantorRepository.findByIdWithContracts(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void getByEmail_notFound_throws() {
        when(guarantorRepository.findByEmail("x")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getByEmail("x"));
    }

    @Test
    void getByPhone_notFound_throws() {
        when(guarantorRepository.findByPhone("x")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getByPhone("x"));
    }

    @Test
    void removeGuarantorFromContract_notLinked() {
        Contract contract = new Contract();
        contract.setGuarantors(new HashSet<>());

        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(Guarantor.class, 1L)).thenReturn(entity);

        ResponseEntity<String> response = service.removeGuarantorFromContract(1L, 10L);

        assertEquals("No estaba vinculado", response.getBody());
    }

    @Test
    void create_blankName_throws() {
        dto.setName(" ");
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_blankPhone_throws() {
        dto.setPhone(" ");
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_blankEmail_throws() {
        dto.setEmail(" ");
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void update_duplicateEmail_throws() {
        Guarantor other = new Guarantor();
        other.setId(2L);
        when(guarantorRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(guarantorRepository.findByEmail("juan@test.com")).thenReturn(Optional.of(other));

        assertThrows(BadRequestException.class, () -> service.update(dto));
    }

    @Test
    void update_duplicatePhone_throws() {
        Guarantor other = new Guarantor();
        other.setId(2L);
        when(guarantorRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(guarantorRepository.findByPhone("123")).thenReturn(Optional.of(other));

        assertThrows(BadRequestException.class, () -> service.update(dto));
    }

    @Test
    void mapIncreaseIndex_null_returnsNull() {
        assertNull(ReflectionTestUtils.invokeMethod(service, "mapIncreaseIndex", (Object) null));
    }



}