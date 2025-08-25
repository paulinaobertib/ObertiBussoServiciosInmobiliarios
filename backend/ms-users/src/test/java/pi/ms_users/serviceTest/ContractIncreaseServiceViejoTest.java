/*package pi.ms_users.serviceTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import pi.ms_users.domain.*;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.dto.ContractIncreaseDTOContractGet;
import pi.ms_users.dto.EmailContractIncreaseDTO;
import pi.ms_users.repository.IContractIncreaseRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.UserRepository.KeycloakUserRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.impl.ContractIncreaseServiceViejoViejo;
import pi.ms_users.service.interf.IEmailService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SuppressWarnings("unused")
@ExtendWith(MockitoExtension.class)
class ContractIncreaseServiceViejoTest {

    @Mock
    private IContractIncreaseRepository contractIncreaseRepository;

    @Mock
    private IContractRepository contractRepository;

    @Mock
    private IEmailService emailService;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private KeycloakUserRepository userRepository;

    @InjectMocks
    private ContractIncreaseServiceViejoViejo service;

    @Test
    void create_whenContractExists_shouldSaveAndReturnOk() {
        ContractIncreaseDTO dto = new ContractIncreaseDTO();
        dto.setContractId(1L);

        Contract contract = new Contract();
        contract.setId(1L);

        ContractIncrease entity = new ContractIncrease();

        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
        when(objectMapper.convertValue(dto, ContractIncrease.class)).thenReturn(entity);
        when(contractIncreaseRepository.save(entity)).thenReturn(entity);

        ResponseEntity<String> response = service.create(dto);

        verify(contractIncreaseRepository).save(entity);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("guardado"));
    }

    @Test
    void delete_whenExists_shouldDeleteAndReturnOk() {
        ContractIncrease entity = new ContractIncrease();
        when(contractIncreaseRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<String> response = service.delete(1L);

        verify(contractIncreaseRepository).delete(entity);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("eliminado"));
    }

    @Test
    void getById_whenExists_shouldReturnDto() {
        ContractIncrease entity = new ContractIncrease();
        Contract contract = new Contract();
        contract.setId(10L);
        entity.setContract(contract);

        ContractIncreaseDTO dto = new ContractIncreaseDTO();

        when(contractIncreaseRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(objectMapper.convertValue(entity, ContractIncreaseDTO.class)).thenReturn(dto);

        ResponseEntity<ContractIncreaseDTO> response = service.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(dto, response.getBody());
        assertEquals(10L, response.getBody().getContractId());
    }

    @Test
    void getByContract_whenContractExists_shouldReturnList() {
        Contract contract = new Contract();
        contract.setId(1L);
        ContractIncrease entity = new ContractIncrease();
        List<ContractIncrease> list = List.of(entity);
        ContractIncreaseDTOContractGet dto = new ContractIncreaseDTOContractGet();

        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
        when(contractIncreaseRepository.findByContractId(1L)).thenReturn(list);
        when(objectMapper.convertValue(entity, ContractIncreaseDTOContractGet.class)).thenReturn(dto);

        ResponseEntity<List<ContractIncreaseDTOContractGet>> response = service.getByContract(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertSame(dto, response.getBody().getFirst());
    }

    @Test
    void applyScheduledIncreases_shouldSaveNewIncrease() {
        LocalDateTime now = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        Contract contract = new Contract();
        contract.setId(1L);
        contract.setIncreaseFrequency(10L);
        contract.setIncrease(5f);
        contract.setUserId("user1");
        contract.setContractStatus(ContractStatus.ACTIVO);
        contract.setEndDate(now.plusDays(100));

        ContractIncrease lastIncrease = new ContractIncrease();
        lastIncrease.setDate(now.minusDays(10));
        lastIncrease.setAmount(BigDecimal.valueOf(100));
        lastIncrease.setCurrency(ContractIncreaseCurrency.USD);

        when(contractRepository.findByStatusAndEndDateAfter(eq(ContractStatus.ACTIVO), any(LocalDateTime.class)))
                .thenReturn(List.of(contract));
        when(contractIncreaseRepository.findTopByContractOrderByDateDesc(contract))
                .thenReturn(Optional.of(lastIncrease));

        service.applyScheduledIncreases();

        verify(contractIncreaseRepository).save(any(ContractIncrease.class));
        verify(emailService, never()).sendContractIncreaseEmail(any());
    }

    @Test
    void applyScheduledIncreases_shouldSendEmail_whenNextIncreaseDateIsTenDaysFromNow() {
        LocalDateTime now = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime tenDaysFromNow = now.plusDays(10);

        Contract contract = new Contract();
        contract.setId(1L);
        contract.setIncreaseFrequency(10L);
        contract.setIncrease(5f);
        contract.setUserId("user1");
        contract.setContractStatus(ContractStatus.ACTIVO);
        contract.setEndDate(now.plusDays(100));

        ContractIncrease lastIncrease = new ContractIncrease();
        lastIncrease.setDate(now);
        lastIncrease.setAmount(BigDecimal.valueOf(100));
        lastIncrease.setCurrency(ContractIncreaseCurrency.USD);

        User user = new User();
        user.setEmail("test@example.com");
        user.setFirstName("Juan");
        user.setLastName("Pérez");

        when(contractRepository.findByStatusAndEndDateAfter(eq(ContractStatus.ACTIVO), any(LocalDateTime.class)))
                .thenReturn(List.of(contract));
        when(contractIncreaseRepository.findTopByContractOrderByDateDesc(contract))
                .thenReturn(Optional.of(lastIncrease));
        when(userRepository.findById("user1")).thenReturn(Optional.of(user));

        doNothing().when(emailService).sendContractIncreaseEmail(any(EmailContractIncreaseDTO.class));

        service.applyScheduledIncreases();

        ArgumentCaptor<EmailContractIncreaseDTO> emailCaptor = ArgumentCaptor.forClass(EmailContractIncreaseDTO.class);
        verify(emailService).sendContractIncreaseEmail(emailCaptor.capture());

        EmailContractIncreaseDTO dto = emailCaptor.getValue();
        assertEquals("test@example.com", dto.getTo());
        assertEquals("Juan", dto.getFirstName());
        assertEquals(contract.getIncreaseFrequency(), dto.getFrequency());
    }

    // casos de error

    @Test
    void getByContract_whenContractNotFound_shouldThrow() {
        when(contractRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.getByContract(1L));
    }

    @Test
    void getById_whenNotFound_shouldThrow() {
        when(contractIncreaseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.getById(1L));
    }

    @Test
    void delete_whenNotFound_shouldThrow() {
        when(contractIncreaseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.delete(1L));
    }

    @Test
    void create_whenContractNotFound_shouldThrow() {
        ContractIncreaseDTO dto = new ContractIncreaseDTO();
        dto.setContractId(1L);

        when(contractRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.create(dto));
    }

    @Test
    void getById_withDifferentTenantUser_throwsAccessDenied() {
        Contract contract = new Contract();
        contract.setId(1L);
        contract.setUserId("user123");

        ContractIncrease increase = new ContractIncrease();
        increase.setId(5L);
        increase.setContract(contract);

        when(contractIncreaseRepository.findById(5L)).thenReturn(Optional.of(increase));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isTenant).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> service.getById(5L));
        }
    }

    @Test
    void getByContract_withDifferentTenantUser_throwsAccessDenied() {
        Contract contract = new Contract();
        contract.setId(1L);
        contract.setUserId("user123");

        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isTenant).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> service.getByContract(1L));
        }
    }

    @Test
    void applyScheduledIncreases_shouldHandleEmailExceptionGracefully() {
        LocalDateTime now = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        Contract contract = new Contract();
        contract.setId(1L);
        contract.setIncreaseFrequency(10L);
        contract.setIncrease(5f);
        contract.setUserId("user1");
        contract.setContractStatus(ContractStatus.ACTIVO);
        contract.setEndDate(now.plusDays(100));

        ContractIncrease lastIncrease = new ContractIncrease();
        lastIncrease.setDate(now);
        lastIncrease.setAmount(BigDecimal.valueOf(100));
        lastIncrease.setCurrency(ContractIncreaseCurrency.USD);

        User user = new User();
        user.setEmail("test@example.com");
        user.setFirstName("Juan");
        user.setLastName("Pérez");

        when(contractRepository.findByStatusAndEndDateAfter(eq(ContractStatus.ACTIVO), any(LocalDateTime.class)))
                .thenReturn(List.of(contract));
        when(contractIncreaseRepository.findTopByContractOrderByDateDesc(contract))
                .thenReturn(Optional.of(lastIncrease));
        when(userRepository.findById("user1")).thenReturn(Optional.of(user));

        doThrow(new RuntimeException("SMTP server error"))
                .when(emailService).sendContractIncreaseEmail(any());

        assertDoesNotThrow(() -> service.applyScheduledIncreases());

        verify(emailService).sendContractIncreaseEmail(any());
    }
}

 */