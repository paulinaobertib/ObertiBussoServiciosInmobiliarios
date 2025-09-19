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
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import pi.ms_users.domain.*;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.repository.IContractIncreaseRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IIncreaseIndexRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.impl.ContractIncreaseService;
import pi.ms_users.service.interf.IEmailService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractIncreaseServiceTest {

    @InjectMocks
    private ContractIncreaseService service;

    @Mock
    private IContractIncreaseRepository contractIncreaseRepository;

    @Mock
    private IContractRepository contractRepository;

    @Mock
    private IIncreaseIndexRepository increaseIndexRepository;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private IEmailService emailService;

    @Mock
    private EntityManager em;

    private ContractIncreaseDTO dto;
    private Contract contract;
    private IncreaseIndex index;
    private User user;
    private ContractIncrease entity;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "em", em);

        dto = new ContractIncreaseDTO();
        dto.setId(1L);
        dto.setDate(LocalDateTime.now());
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setAmount(BigDecimal.valueOf(1000));
        dto.setAdjustment(10);
        dto.setNote("nota");
        dto.setPeriodFrom(LocalDateTime.of(2025, 1, 1, 0, 0));
        dto.setPeriodTo(LocalDateTime.of(2025, 12, 31, 23, 59));
        dto.setContractId(100L);
        dto.setIndexId(200L);

        contract = new Contract();
        contract.setId(100L);
        contract.setUserId("50");

        index = new IncreaseIndex();
        index.setId(200L);
        index.setName("IPC");

        user = new User();
        user.setId("50");
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setEmail("juan@mail.com");

        entity = new ContractIncrease();
        entity.setId(1L);
        entity.setContract(contract);
        entity.setIndex(index);
    }

    // casos de exito

    @Test
    void create_success() {
        dto.setId(null);
        when(increaseIndexRepository.existsById(dto.getIndexId())).thenReturn(true);
        when(contractRepository.findById(dto.getContractId())).thenReturn(Optional.of(contract));
        when(userRepository.findById(contract.getUserId())).thenReturn(Optional.of(user));
        when(em.getReference(Contract.class, dto.getContractId())).thenReturn(contract);
        when(em.getReference(IncreaseIndex.class, dto.getIndexId())).thenReturn(index);

        ResponseEntity<String> response = service.create(dto);

        assertEquals("Se ha guardado el incremento del contrato.", response.getBody());
        verify(contractIncreaseRepository).save(any(ContractIncrease.class));
        verify(emailService).sendContractIncreaseLoadedEmail(any(), eq(contract.getId()));
    }

    @Test
    void update_success() {
        when(contractIncreaseRepository.findById(dto.getId())).thenReturn(Optional.of(entity));
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(userRepository.findById(contract.getUserId())).thenReturn(Optional.of(user));

        ResponseEntity<String> response = service.update(dto);

        assertEquals("Se ha actualizado el incremento.", response.getBody());
        verify(contractIncreaseRepository).save(any(ContractIncrease.class));
        verify(emailService).sendContractIncreaseLoadedEmailUpdate(any(), eq(contract.getId()));
    }

    @Test
    void delete_success() {
        when(contractIncreaseRepository.existsById(1L)).thenReturn(true);

        ResponseEntity<String> response = service.delete(1L);

        assertEquals("Se ha eliminado el incremento.", response.getBody());
        verify(contractIncreaseRepository).deleteById(1L);
    }

    @Test
    void deleteByContractId_success() {
        when(contractRepository.existsById(100L)).thenReturn(true);

        ResponseEntity<String> response = service.deleteByContractId(100L);

        assertEquals("Se han eliminado los incrementos vinculados al contrato.", response.getBody());
        verify(contractIncreaseRepository).deleteByContractId(100L);
    }

    @Test
    void getById_success() {
        when(contractIncreaseRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<ContractIncreaseDTO> response = service.getById(1L);

        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getByContractId_success() {
        when(contractRepository.existsById(100L)).thenReturn(true);
        when(contractIncreaseRepository.findByContractId(100L)).thenReturn(List.of(entity));

        ResponseEntity<List<ContractIncreaseDTO>> response = service.getByContractId(100L);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getLastByContractId_success() {
        when(contractRepository.existsById(100L)).thenReturn(true);
        when(contractIncreaseRepository.findLastByContractId(100L)).thenReturn(Optional.of(entity));

        ResponseEntity<ContractIncreaseDTO> response = service.getLastByContractId(100L);

        assertEquals(1L, response.getBody().getId());
    }

    // casos de error

    @Test
    void create_withId_throws() {
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_negativeAmount_throws() {
        dto.setId(null);
        dto.setAmount(BigDecimal.valueOf(-100));
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_indexNotFound_throws() {
        dto.setId(null);
        when(increaseIndexRepository.existsById(dto.getIndexId())).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void create_contractNotFound_throws() {
        dto.setId(null);
        when(increaseIndexRepository.existsById(dto.getIndexId())).thenReturn(true);
        when(contractRepository.findById(dto.getContractId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void create_userNotFound_throws() {
        dto.setId(null);
        when(increaseIndexRepository.existsById(dto.getIndexId())).thenReturn(true);
        when(contractRepository.findById(dto.getContractId())).thenReturn(Optional.of(contract));
        when(userRepository.findById(contract.getUserId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void update_nullId_throws() {
        dto.setId(null);
        assertThrows(BadRequestException.class, () -> service.update(dto));
    }

    @Test
    void update_notFound_throws() {
        when(contractIncreaseRepository.findById(dto.getId())).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void update_contractNotFound_throws() {
        when(contractIncreaseRepository.findById(dto.getId())).thenReturn(Optional.of(entity));
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void update_userNotFound_throws() {
        when(contractIncreaseRepository.findById(dto.getId())).thenReturn(Optional.of(entity));
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(userRepository.findById(contract.getUserId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void delete_notFound_throws() {
        when(contractIncreaseRepository.existsById(1L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.delete(1L));
    }

    @Test
    void deleteByContractId_contractNotFound_throws() {
        when(contractRepository.existsById(100L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.deleteByContractId(100L));
    }

    @Test
    void getById_notFound_throws() {
        when(contractIncreaseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void getByContractId_contractNotFound_throws() {
        when(contractRepository.existsById(100L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.getByContractId(100L));
    }

    @Test
    void getLastByContractId_contractNotFound_throws() {
        when(contractRepository.existsById(100L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.getLastByContractId(100L));
    }

    @Test
    void getLastByContractId_incrementNotFound_throws() {
        when(contractRepository.existsById(100L)).thenReturn(true);
        when(contractIncreaseRepository.findLastByContractId(100L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getLastByContractId(100L));
    }
}

