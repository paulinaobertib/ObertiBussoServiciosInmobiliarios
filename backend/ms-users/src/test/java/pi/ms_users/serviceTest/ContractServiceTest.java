package pi.ms_users.serviceTest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import pi.ms_users.domain.*;
import pi.ms_users.dto.*;
import pi.ms_users.dto.feign.PropertyDTO;
import pi.ms_users.dto.feign.Status;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.impl.ContractService;
import pi.ms_users.service.interf.IContractIncreaseService;
import pi.ms_users.service.interf.IEmailService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock
    private IContractRepository contractRepository;

    @Mock
    private IContractIncreaseService contractIncreaseService;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private IEmailService emailService;

    @InjectMocks
    private ContractService contractService;

    private Contract contract;
    private ContractDTO contractDTO;
    private User user;
    private PropertyDTO propertyDTO;
    private ContractIncrease contractIncrease;
    private ContractIncreaseDTO contractIncreaseDTO;

    @BeforeEach
    void setup() {
        contract = new Contract();
        contract.setId(1L);
        contract.setUserId("user123");
        contract.setPropertyId(10L);
        contract.setContractType(ContractType.TEMPORAL);
        contract.setStartDate(LocalDateTime.now().minusDays(10));
        contract.setEndDate(LocalDateTime.now().plusDays(20));
        contract.setContractStatus(ContractStatus.ACTIVO);
        contract.setIncrease(5f);
        contract.setIncreaseFrequency(12L);
        contract.setContractIncrease(new ArrayList<>());

        contractDTO = new ContractDTO();
        contractDTO.setId(1L);
        contractDTO.setUserId("user123");
        contractDTO.setPropertyId(10L);
        contractDTO.setContractType(ContractType.TEMPORAL);
        contractDTO.setStartDate(contract.getStartDate());
        contractDTO.setEndDate(contract.getEndDate());
        contractDTO.setContractStatus(ContractStatus.ACTIVO);
        contractDTO.setIncrease(5f);
        contractDTO.setIncreaseFrequency(12L);
        contractDTO.setContractIncrease(new ArrayList<>());

        user = new User();
        user.setId("user123");
        user.setEmail("test@mail.com");
        user.setFirstName("Test");

        propertyDTO = new PropertyDTO();
        propertyDTO.setId(10L);

        contractIncrease = new ContractIncrease();
        contractIncrease.setId(100L);
        contractIncrease.setAmount(new BigDecimal("1000"));
        contractIncrease.setCurrency(ContractIncreaseCurrency.USD);
        contractIncrease.setDate(LocalDateTime.now().minusDays(10));
        contractIncrease.setContract(contract);

        contractIncreaseDTO = new ContractIncreaseDTO();
        contractIncreaseDTO.setId(100L);
        contractIncreaseDTO.setAmount(new BigDecimal("1000"));
        contractIncreaseDTO.setCurrency(ContractIncreaseCurrency.USD);
        contractIncreaseDTO.setDate(contractIncrease.getDate());
        contractIncreaseDTO.setContractId(contract.getId());
    }

    // casos de exito

    @Test
    void testCreate_success() {
        propertyDTO.setStatus("DISPONIBLE");

        when(propertyRepository.getById(contractDTO.getPropertyId())).thenReturn(propertyDTO);
        when(userRepository.findById(contractDTO.getUserId())).thenReturn(Optional.of(user));
        when(userRepository.addRoleToUser(user.getId(), "tenant")).thenReturn(List.of("tenant")); // ✅ necesario
        when(propertyRepository.updateStatus(propertyDTO.getId(), Status.ALQUILADA))
                .thenReturn(ResponseEntity.ok("OK"));

        when(objectMapper.convertValue(contractDTO, Contract.class)).thenReturn(contract);
        when(contractRepository.save(contract)).thenReturn(contract);
        when(objectMapper.convertValue(any(ContractIncrease.class), eq(ContractIncreaseDTO.class))).thenReturn(contractIncreaseDTO);
        when(contractIncreaseService.create(contractIncreaseDTO)).thenReturn(ResponseEntity.ok("Success"));
        doNothing().when(emailService).sendNewContractEmail(any());

        ResponseEntity<String> response = contractService.create(contractDTO, new BigDecimal("1000"), ContractIncreaseCurrency.USD);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha creado el contrato.", response.getBody());

        verify(propertyRepository).getById(contractDTO.getPropertyId());
        verify(userRepository).findById(contractDTO.getUserId());
        verify(userRepository).addRoleToUser(user.getId(), "tenant");
        verify(propertyRepository).updateStatus(propertyDTO.getId(), Status.ALQUILADA);
        verify(contractRepository).save(contract);
        verify(emailService).sendNewContractEmail(any(EmailContractDTO.class));
        verify(contractIncreaseService).create(contractIncreaseDTO);
    }

    @Test
    void testUpdate_success() {
        when(contractRepository.findById(contractDTO.getId())).thenReturn(Optional.of(contract));
        when(objectMapper.convertValue(eq(contractDTO.getContractIncrease()), any(TypeReference.class)))
                .thenReturn(new ArrayList<>());

        when(contractRepository.save(contract)).thenReturn(contract);

        ResponseEntity<String> response = contractService.update(contractDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha actualizado el contrato", response.getBody());

        verify(contractRepository).save(contract);
        assertEquals(contractDTO.getContractStatus(), contract.getContractStatus());
        assertEquals(contractDTO.getContractType(), contract.getContractType());
    }

    @Test
    void testUpdateStatus_success_toggleToInactive() {
        contract.setContractStatus(ContractStatus.ACTIVO);
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(contractRepository.save(contract)).thenReturn(contract);

        ResponseEntity<String> response = contractService.updateStatus(contract.getId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("INACTIVO"));
        assertEquals(ContractStatus.INACTIVO, contract.getContractStatus());
        verify(contractRepository).save(contract);
    }

    @Test
    void testDelete_success() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        doNothing().when(contractRepository).delete(contract);

        ResponseEntity<String> response = contractService.delete(contract.getId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado el contrato.", response.getBody());
        verify(contractRepository).delete(contract);
    }

    @Test
    void testGetById_success() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));

        ResponseEntity<ContractDTO> response = contractService.getById(contract.getId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(contract.getId(), response.getBody().getId());
    }

    @Test
    void testGetByUserId_success() {
        when(userRepository.exist(contract.getUserId())).thenReturn(true);
        when(contractRepository.findByUserId(contract.getUserId())).thenReturn(List.of(contract));

        ResponseEntity<List<ContractDTO>> response = contractService.getByUserId(contract.getUserId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isEmpty());
        assertEquals(contract.getId(), response.getBody().getFirst().getId());
    }

    @Test
    void testGetByPropertyId_success() {
        when(propertyRepository.getById(contract.getPropertyId())).thenReturn(propertyDTO);
        when(contractRepository.findByPropertyId(propertyDTO.getId())).thenReturn(List.of(contract));

        ResponseEntity<List<ContractDTO>> response = contractService.getByPropertyId(contract.getPropertyId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isEmpty());
        assertEquals(contract.getId(), response.getBody().getFirst().getId());
    }

    @Test
    void testGetByType_success() {
        when(contractRepository.findByType(contract.getContractType())).thenReturn(List.of(contract));

        ResponseEntity<List<ContractDTO>> response = contractService.getByType(contract.getContractType());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isEmpty());
        assertEquals(contract.getId(), response.getBody().getFirst().getId());
    }

    @Test
    void testGetByStatus_success() {
        when(contractRepository.findByStatus(contract.getContractStatus())).thenReturn(List.of(contract));

        ResponseEntity<List<ContractDTO>> response = contractService.getByStatus(contract.getContractStatus());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isEmpty());
        assertEquals(contract.getId(), response.getBody().getFirst().getId());
    }

    @Test
    void testGetByDateBetween_success() {
        LocalDateTime start = LocalDateTime.now().minusDays(5);
        LocalDateTime end = LocalDateTime.now().plusDays(5);

        when(contractRepository.findByDateBetween(start, end)).thenReturn(List.of(contract));

        ResponseEntity<List<ContractDTO>> response = contractService.getByDateBetween(start, end);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isEmpty());
        assertEquals(contract.getId(), response.getBody().getFirst().getId());
    }

    @Test
    void testGetAll_success() {
        when(contractRepository.findAll()).thenReturn(List.of(contract));

        ResponseEntity<List<ContractDTO>> response = contractService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isEmpty());
        assertEquals(contract.getId(), response.getBody().getFirst().getId());
    }

    @Test
    void testApplyScheduledInactive_success() {
        when(contractRepository.findContractsEndingToday(ContractStatus.ACTIVO)).thenReturn(List.of(contract));
        when(contractRepository.save(contract)).thenReturn(contract);

        contractService.applyScheduledInactive();

        assertEquals(ContractStatus.INACTIVO, contract.getContractStatus());
        verify(contractRepository).save(contract);
    }

    @Test
    void testApplyScheduledSoonInactive_success() {
        LocalDate targetDate = LocalDate.now().plusDays(30);
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.plusDays(1).atStartOfDay().minusNanos(1);

        contract.setEndDate(startOfDay.plusHours(2));

        when(contractRepository.findByStatusAndEndDateBetween(ContractStatus.ACTIVO, startOfDay, endOfDay))
                .thenReturn(List.of(contract));
        when(userRepository.findById(contract.getUserId())).thenReturn(Optional.of(user));

        doNothing().when(emailService).sendContractExpirationReminder(any(EmailExpirationContract.class));

        contractService.applyScheduledSoonInactive();

        verify(emailService).sendContractExpirationReminder(any(EmailExpirationContract.class));
    }

    @Test
    void applyScheduledPayment_success() {
        LocalDate fixedDate = LocalDate.of(2025, 7, 1);
        try (MockedStatic<LocalDate> localDateMock = Mockito.mockStatic(LocalDate.class, Mockito.CALLS_REAL_METHODS)) {
            localDateMock.when(LocalDate::now).thenReturn(fixedDate);

            contract.setContractStatus(ContractStatus.ACTIVO);
            contract.getContractIncrease().add(contractIncrease);

            when(contractRepository.findByStatus(ContractStatus.ACTIVO)).thenReturn(List.of(contract));
            when(userRepository.findById(contract.getUserId())).thenReturn(Optional.of(user));
            doNothing().when(emailService).sendRentPaymentReminder(any(EmailPaymentReminderDTO.class));

            contractService.applyScheduledPayment();

            verify(contractRepository).findByStatus(ContractStatus.ACTIVO);
            verify(userRepository).findById(contract.getUserId());
            verify(emailService).sendRentPaymentReminder(any(EmailPaymentReminderDTO.class));
        }
    }

    // casos de error

    @Test
    void testUpdate_contractNotFound_throwsException() {
        when(contractRepository.findById(anyLong())).thenReturn(Optional.empty());

        ContractDTO dto = new ContractDTO();
        dto.setId(1L);

        assertThrows(NoSuchElementException.class,
                () -> contractService.update(dto));
    }

    @Test
    void testUpdateStatus_contractNotFound_throwsException() {
        when(contractRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> contractService.updateStatus(1L));
    }

    @Test
    void testDelete_contractNotFound_throwsException() {
        when(contractRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> contractService.delete(1L));
    }

    @Test
    void testGetById_contractNotFound_throwsException() {
        when(contractRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> contractService.getById(1L));
    }

    @Test
    void testGetByUserId_userNotFound_throwsException() {
        when(userRepository.exist(anyString())).thenReturn(false);

        assertThrows(NoSuchElementException.class,
                () -> contractService.getByUserId("user123"));
    }

    @Test
    void testGetByPropertyId_propertyNotFound_throwsException() {
        when(propertyRepository.getById(anyLong())).thenThrow(new EntityNotFoundException("No existe propiedad"));

        assertThrows(EntityNotFoundException.class,
                () -> contractService.getByPropertyId(99L));
    }

    @Test
    void testCreate_emailServiceThrowsException_shouldPropagate() {
        PropertyDTO mockedProperty = mock(PropertyDTO.class);
        when(mockedProperty.getStatus()).thenReturn("DISPONIBLE");
        when(mockedProperty.getId()).thenReturn(1L);
        when(propertyRepository.getById(anyLong())).thenReturn(mockedProperty);

        User user = new User();
        user.setId("user123");
        user.setEmail("test@mail.com");
        user.setFirstName("Nombre");
        when(userRepository.findById(anyString())).thenReturn(Optional.of(user));
        when(userRepository.addRoleToUser(anyString(), eq("tenant"))).thenReturn(List.of("tenant"));

        when(propertyRepository.updateStatus(anyLong(), eq(Status.ALQUILADA)))
                .thenReturn(ResponseEntity.ok("OK"));

        Contract mockContract = new Contract();
        mockContract.setId(123L);
        when(contractRepository.save(any())).thenReturn(mockContract);

        when(objectMapper.convertValue(any(ContractDTO.class), eq(Contract.class))).thenReturn(mockContract);

        doThrow(new RuntimeException("Email service failure"))
                .when(emailService).sendNewContractEmail(any());

        ContractDTO dto = new ContractDTO();
        dto.setUserId("user123");
        dto.setPropertyId(1L);
        dto.setStartDate(LocalDateTime.now());
        dto.setEndDate(LocalDateTime.now().plusDays(30));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> contractService.create(dto, BigDecimal.TEN, ContractIncreaseCurrency.ARS));

        assertEquals("Email service failure", ex.getMessage());
    }

    @Test
    void applyScheduledSoonInactive_shouldLogErrorButNotThrow_whenEmailServiceThrowsException() {
        LocalDate targetDate = LocalDate.now().plusDays(30);
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.plusDays(1).atStartOfDay().minusNanos(1);

        Contract contract = new Contract();
        contract.setUserId("user123");
        contract.setEndDate(endOfDay);

        User user = new User();
        user.setId("user123");
        user.setEmail("test@example.com");
        user.setFirstName("Test");

        when(contractRepository.findByStatusAndEndDateBetween(
                eq(ContractStatus.ACTIVO), eq(startOfDay), eq(endOfDay)))
                .thenReturn(List.of(contract));

        when(userRepository.findById("user123"))
                .thenReturn(Optional.of(user));

        doThrow(new RuntimeException("SMTP error"))
                .when(emailService).sendContractExpirationReminder(any(EmailExpirationContract.class));

        assertDoesNotThrow(() -> contractService.applyScheduledSoonInactive());

        verify(emailService, times(1)).sendContractExpirationReminder(any(EmailExpirationContract.class));
    }

    @Test
    void getById_withDifferentTenantUser_throwsAccessDenied() {
        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isTenant).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> contractService.getById(1L));
        }
    }

    @Test
    void getByUserId_withDifferentTenantUser_throwsAccessDenied() {
        when(userRepository.exist("user123")).thenReturn(true);

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isTenant).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> contractService.getByUserId("user123"));
        }
    }

    @Test
    void applyScheduledPayment_skipsIfNotFirstDay() {
        LocalDate fixedDate = LocalDate.of(2025, 7, 2);
        try (MockedStatic<LocalDate> localDateMock = Mockito.mockStatic(LocalDate.class)) {
            localDateMock.when(LocalDate::now).thenReturn(fixedDate);

            contractService.applyScheduledPayment();

            verifyNoInteractions(contractRepository);
            verifyNoInteractions(userRepository);
            verifyNoInteractions(emailService);
        }
    }

    @Test
    void applyScheduledPayment_contractWithoutIncrease_logsErrorAndContinues() {
        LocalDate fixedDate = LocalDate.of(2025, 7, 1);
        try (MockedStatic<LocalDate> localDateMock = Mockito.mockStatic(LocalDate.class, Mockito.CALLS_REAL_METHODS)) {
            localDateMock.when(LocalDate::now).thenReturn(fixedDate);

            Contract contractSinAumento = new Contract();
            contractSinAumento.setId(2L);
            contractSinAumento.setUserId("user456");
            contractSinAumento.setContractStatus(ContractStatus.ACTIVO);
            contractSinAumento.setContractIncrease(Collections.emptyList());

            when(contractRepository.findByStatus(ContractStatus.ACTIVO)).thenReturn(List.of(contractSinAumento));
            when(userRepository.findById(contractSinAumento.getUserId())).thenReturn(Optional.of(user));

            contractService.applyScheduledPayment();

            verify(contractRepository).findByStatus(ContractStatus.ACTIVO);
            verify(userRepository).findById(contractSinAumento.getUserId());
            verify(emailService, never()).sendRentPaymentReminder(any());
        }
    }

    @Test
    void applyScheduledPayment_emailServiceThrows_logsErrorButContinues() {
        LocalDate fixedDate = LocalDate.of(2025, 7, 1);
        try (MockedStatic<LocalDate> localDateMock = Mockito.mockStatic(LocalDate.class, Mockito.CALLS_REAL_METHODS)) {
            localDateMock.when(LocalDate::now).thenReturn(fixedDate);

            contract.setContractIncrease(List.of(contractIncrease));
            when(contractRepository.findByStatus(ContractStatus.ACTIVO)).thenReturn(List.of(contract));
            when(userRepository.findById(contract.getUserId())).thenReturn(Optional.of(user));

            doThrow(new RuntimeException("Error al enviar email"))
                    .when(emailService).sendRentPaymentReminder(any(EmailPaymentReminderDTO.class));

            contractService.applyScheduledPayment();

            verify(emailService).sendRentPaymentReminder(any(EmailPaymentReminderDTO.class));
        }
    }

    @Test
    void testCreate_propertyNotFound() {
        when(propertyRepository.getById(contractDTO.getPropertyId()))
                .thenThrow(FeignException.NotFound.class);

        ResponseEntity<String> response = contractService.create(contractDTO, new BigDecimal("1000"), ContractIncreaseCurrency.USD);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("No se ha encontrado la propiedad.", response.getBody());
    }

    @Test
    void testCreate_propertyNotAvailable() {
        propertyDTO.setStatus("RESERVADA");
        when(propertyRepository.getById(contractDTO.getPropertyId())).thenReturn(propertyDTO);

        ResponseEntity<String> response = contractService.create(contractDTO, new BigDecimal("1000"), ContractIncreaseCurrency.USD);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("La propiedad no se encuentra disponible.", response.getBody());
    }

    @Test
    void testCreate_userNotFound() {
        propertyDTO.setStatus("DISPONIBLE");
        when(propertyRepository.getById(contractDTO.getPropertyId())).thenReturn(propertyDTO);
        when(userRepository.findById(contractDTO.getUserId())).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> contractService.create(contractDTO, new BigDecimal("1000"), ContractIncreaseCurrency.USD));

        assertEquals("No se ha encontrado el usuario.", exception.getMessage());
    }

    @Test
    void testCreate_userRoleAssignmentFails() {
        propertyDTO.setStatus("DISPONIBLE");
        when(propertyRepository.getById(contractDTO.getPropertyId())).thenReturn(propertyDTO);
        when(userRepository.findById(contractDTO.getUserId())).thenReturn(Optional.of(user));
        when(userRepository.addRoleToUser(user.getId(), "tenant")).thenReturn(List.of()); // no contiene tenant

        ResponseEntity<String> response = contractService.create(contractDTO, new BigDecimal("1000"), ContractIncreaseCurrency.USD);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("No se ha podido modificar el rol del usuario.", response.getBody());
    }

    @Test
    void testCreate_propertyStatusUpdateFails() {
        propertyDTO.setStatus("DISPONIBLE");
        when(propertyRepository.getById(contractDTO.getPropertyId())).thenReturn(propertyDTO);
        when(userRepository.findById(contractDTO.getUserId())).thenReturn(Optional.of(user));
        when(userRepository.addRoleToUser(user.getId(), "tenant")).thenReturn(List.of("tenant"));
        when(propertyRepository.updateStatus(propertyDTO.getId(), Status.ALQUILADA))
                .thenReturn(ResponseEntity.badRequest().body("Error"));

        ResponseEntity<String> response = contractService.create(contractDTO, new BigDecimal("1000"), ContractIncreaseCurrency.USD);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("No se ha podido modificar el estado de la propiedad.", response.getBody());
    }
}