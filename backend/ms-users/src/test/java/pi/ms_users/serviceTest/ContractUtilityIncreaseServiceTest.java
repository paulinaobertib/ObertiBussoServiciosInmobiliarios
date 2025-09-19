package pi.ms_users.serviceTest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import pi.ms_users.domain.*;
import pi.ms_users.dto.ContractUtilityIncreaseDTO;
import pi.ms_users.dto.ContractUtilityIncreaseGetDTO;
import pi.ms_users.dto.email.EmailUtilityAmountLoadedDTO;
import pi.ms_users.repository.IContractUtilityIncreaseRepository;
import pi.ms_users.repository.IContractUtilityRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.impl.ContractUtilityIncreaseService;
import pi.ms_users.service.interf.IEmailService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ContractUtilityIncreaseServiceTest {

    @Mock
    private IContractUtilityIncreaseRepository increaseRepository;

    @Mock
    private IContractUtilityRepository utilityRepository;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private IEmailService emailService;

    @Mock
    private EntityManager em;

    @InjectMocks
    private ContractUtilityIncreaseService service;

    private ContractUtilityIncreaseDTO dto;
    private ContractUtilityIncrease entity;
    private ContractUtility utility;
    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(service, "em", em);

        dto = new ContractUtilityIncreaseDTO();
        dto.setId(1L);
        dto.setAdjustmentDate(LocalDate.now());
        dto.setAmount(BigDecimal.TEN);
        dto.setContractUtilityId(100L);

        entity = new ContractUtilityIncrease();
        entity.setId(1L);
        entity.setAdjustmentDate(LocalDate.now());
        entity.setAmount(BigDecimal.TEN);

        Contract contract = new Contract();
        contract.setId(200L);
        contract.setUserId("user123");

        Utility u = new Utility();
        u.setId(300L);
        u.setName("Luz");

        utility = new ContractUtility();
        utility.setId(100L);
        utility.setContract(contract);
        utility.setUtility(u);

        user = new User();
        user.setId("user123");
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setEmail("juan@test.com");
    }

    // casos de exito

    @Test
    void create_success() {
        when(utilityRepository.findById(dto.getContractUtilityId())).thenReturn(Optional.of(utility));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        ResponseEntity<String> response = service.create(dto);

        assertEquals("Incremento creado correctamente.", response.getBody());
        verify(increaseRepository).save(any(ContractUtilityIncrease.class));
        verify(emailService).sendUtilityAmountLoadedEmail(any(EmailUtilityAmountLoadedDTO.class), eq(200L));
    }

    @Test
    void update_success() {
        when(utilityRepository.findById(dto.getContractUtilityId())).thenReturn(Optional.of(utility));
        when(increaseRepository.findById(dto.getId())).thenReturn(Optional.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        ResponseEntity<String> response = service.update(dto);

        assertEquals("Incremento actualizado correctamente.", response.getBody());
        verify(increaseRepository).save(entity);
        verify(emailService).sendUtilityAmountLoadedEmailUpdate(any(EmailUtilityAmountLoadedDTO.class), eq(200L));
    }

    @Test
    void delete_success() {
        when(increaseRepository.existsById(1L)).thenReturn(true);

        ResponseEntity<String> response = service.delete(1L);

        assertEquals("Incremento eliminado correctamente.", response.getBody());
        verify(increaseRepository).deleteById(1L);
    }

    @Test
    void getById_success() {
        ContractUtility cu = new ContractUtility();
        cu.setId(100L);
        entity.setContractUtility(cu);

        when(increaseRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<ContractUtilityIncreaseDTO> response = service.getById(1L);

        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getByContractUtility_success() {
        when(utilityRepository.existsById(100L)).thenReturn(true);
        when(increaseRepository.findByContractUtilityId(100L)).thenReturn(List.of(entity));

        ResponseEntity<List<ContractUtilityIncreaseGetDTO>> response = service.getByContractUtility(100L);

        assertEquals(1, response.getBody().size());
        assertEquals(entity.getId(), response.getBody().getFirst().getId());
    }

    // casos de error

    @Test
    void create_missingUtilityId_throwsBadRequest() {
        dto.setContractUtilityId(null);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_utilityNotFound_throwsBadRequest() {
        when(utilityRepository.findById(dto.getContractUtilityId())).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_userNotFound_throwsEntityNotFound() {
        when(utilityRepository.findById(dto.getContractUtilityId())).thenReturn(Optional.of(utility));
        when(userRepository.findById("user123")).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void update_missingId_throwsBadRequest() {
        dto.setId(null);
        assertThrows(BadRequestException.class, () -> service.update(dto));
    }

    @Test
    void update_utilityNotFound_throwsBadRequest() {
        when(utilityRepository.findById(dto.getContractUtilityId())).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class, () -> service.update(dto));
    }

    @Test
    void update_increaseNotFound_throwsEntityNotFound() {
        when(utilityRepository.findById(dto.getContractUtilityId())).thenReturn(Optional.of(utility));
        when(increaseRepository.findById(dto.getId())).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void update_userNotFound_throwsEntityNotFound() {
        when(utilityRepository.findById(dto.getContractUtilityId())).thenReturn(Optional.of(utility));
        when(increaseRepository.findById(dto.getId())).thenReturn(Optional.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void delete_increaseNotFound_throwsEntityNotFound() {
        when(increaseRepository.existsById(1L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.delete(1L));
    }

    @Test
    void getById_notFound_throwsEntityNotFound() {
        when(increaseRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void getByContractUtility_notFound_throwsEntityNotFound() {
        when(utilityRepository.existsById(100L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.getByContractUtility(100L));
    }
}