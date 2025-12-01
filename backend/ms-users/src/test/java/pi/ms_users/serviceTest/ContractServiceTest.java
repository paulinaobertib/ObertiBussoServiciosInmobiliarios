package pi.ms_users.serviceTest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;
import pi.ms_users.domain.*;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.dto.ContractGetDTO;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.email.EmailContractExpiringSoonListAdminDTO;
import pi.ms_users.dto.email.EmailContractIncreaseAdminDTO;
import pi.ms_users.dto.email.EmailNewContractDTO;
import pi.ms_users.dto.feign.PropertyDTO;
import pi.ms_users.dto.feign.Status;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IIncreaseIndexRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.impl.ContractService;
import pi.ms_users.service.interf.IEmailService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @InjectMocks
    private ContractService service;

    @Mock
    private IContractRepository contractRepository;

    @Mock
    private IIncreaseIndexRepository increaseIndexRepository;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private IEmailService emailService;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private EntityManager em;

    private ContractDTO dto;
    private Contract entity;
    private User user;
    private PropertyDTO propertyDTO;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "em", em);

        dto = new ContractDTO();
        dto.setId(1L);
        dto.setUserId("user123");
        dto.setPropertyId(100L);
        dto.setAdjustmentIndexId(200L);
        dto.setHasDeposit(false);

        entity = new Contract();
        entity.setId(1L);
        entity.setUserId("user123");
        entity.setPropertyId(100L);
        entity.setContractStatus(ContractStatus.ACTIVO);

        user = new User();
        user.setId("user123");
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setEmail("juan@mail.com");

        propertyDTO = new PropertyDTO();
        propertyDTO.setId(100L);
    }

    @BeforeEach
    void forceTimezone() {
        TimeZone.setDefault(TimeZone.getTimeZone("America/Argentina/Buenos_Aires"));
    }

    // casos de exito

    @Test
    void create_success() {
        when(increaseIndexRepository.existsById(dto.getAdjustmentIndexId())).thenReturn(true);
        when(userRepository.findById(dto.getUserId())).thenReturn(Optional.of(user));
        when(propertyRepository.getById(dto.getPropertyId())).thenReturn(propertyDTO);
        when(contractRepository.save(any(Contract.class))).thenReturn(entity);

        ResponseEntity<String> response = service.create(dto);

        assertEquals("Se ha creado el contrato.", response.getBody());
        verify(emailService).sendNewContractEmail(any(EmailNewContractDTO.class), eq(entity.getId()));
    }

    @Test
    void update_success() {
        when(contractRepository.findById(dto.getId())).thenReturn(Optional.of(entity));
        when(increaseIndexRepository.existsById(dto.getAdjustmentIndexId())).thenReturn(true);

        ResponseEntity<String> response = service.update(dto);

        assertEquals("Se ha actualizado el contrato.", response.getBody());
        verify(contractRepository).save(entity);
    }

    @Test
    void updateStatus_success_inactivo() {
        entity.setContractStatus(ContractStatus.ACTIVO);
        when(contractRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        ResponseEntity<String> response = service.updateStatus(1L);

        assertEquals("Se ha actualizado el estado del contrato.", response.getBody());
        verify(emailService).sendContractExpiredEmail(any());
        verify(emailService, never()).sendAdminContractExpiredEmail(any());
    }


    @Test
    void delete_success() {
        entity.setContractStatus(ContractStatus.ACTIVO);
        when(contractRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        ResponseEntity<String> response = service.delete(1L);

        assertEquals("Se ha eliminado el contrato.", response.getBody());
        verify(contractRepository).deleteById(1L);
        verify(propertyRepository).updateStatus(entity.getPropertyId(), Status.ESPERA);
        verify(emailService, never()).sendAdminContractExpiredEmail(any());
    }


    @Test
    void getById_success() {
        when(contractRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<ContractGetDTO> response = service.getById(1L);

        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void updatePropertyStatusAndContract_success() {
        when(propertyRepository.getById(100L)).thenReturn(propertyDTO);
        when(contractRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        ResponseEntity<String> response = service.updatePropertyStatusAndContract(100L, 1L, Status.DISPONIBLE);

        assertEquals("Se ha actualizado el estado de la propiedad y del contrato.", response.getBody());
        verify(propertyRepository).updateStatus(100L, Status.DISPONIBLE);
        verify(emailService).sendContractExpiredEmail(any());
    }

    @Test
    void sendEmailsForContractsWithIncreaseInOneMonth_success() {
        ContractIncrease increase = new ContractIncrease();
        increase.setDate(LocalDate.now().plusDays(30).minusMonths(1).atStartOfDay());

        entity.setId(1L);
        entity.setAdjustmentFrequencyMonths(1);
        entity.setContractIncrease(Set.of(increase));
        entity.setAdjustmentIndex(new IncreaseIndex(200L, "IPC", "Índice IPC"));
        entity.setUserId("user123");

        user.setId("user123");
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setEmail("juan@test.com");

        when(contractRepository.findAll()).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        service.sendEmailsForContractsWithIncreaseInOneMonth();

        verify(emailService).sendContractUpcomingIncreaseOneMonthEmail(any(), eq(entity.getId()));
    }

    @Test
    void sendAdminContractsWithIncreaseInOneMonth_success() {
        ContractIncrease increase = new ContractIncrease();
        increase.setDate(LocalDate.now().plusDays(30).minusMonths(1).atStartOfDay());

        entity.setId(1L);
        entity.setAdjustmentFrequencyMonths(1);
        entity.setContractIncrease(Set.of(increase));
        entity.setAdjustmentIndex(new IncreaseIndex(200L, "IPC", "Índice IPC"));
        entity.setUserId("user123");

        user.setId("user123");
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setEmail("juan@test.com");

        when(contractRepository.findAll()).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        service.sendAdminContractsWithIncreaseInOneMonth();

        verify(emailService).sendAdminContractUpcomingIncreaseListEmail(any(EmailContractIncreaseAdminDTO.class));
    }

    @Test
    void sendEmailsForContractsExpiringInOneMonth_success() {
        entity.setEndDate(LocalDate.now().plusMonths(1));

        when(contractRepository.findContractsExpiringInOneMonth(any())).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        service.sendEmailsForContractsExpiringInOneMonth();

        verify(emailService).sendContractExpiringSoonEmail(any(), eq(entity.getId()));
        verify(emailService).sendAdminContractsExpiringSoonListEmail(any(EmailContractExpiringSoonListAdminDTO.class));
    }

    @Test
    void sendEmailsForContractsExpiringToday_success() {
        entity.setEndDate(LocalDate.now());

        when(contractRepository.findContractsExpiringToday(any())).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(contractRepository.findById(entity.getId())).thenReturn(Optional.of(entity));

        service.sendEmailsForContractsExpiringToday();

        verify(userRepository, atLeastOnce()).deleteRoleToUser("user123", "tenant");
    }

    @Test
    void sendPaymentRemindersForActiveContracts_success() {
        entity.setInitialAmount(BigDecimal.valueOf(5000));
        entity.setCurrency(PaymentCurrency.ARS);

        when(contractRepository.findActiveContractsNotExpiringNextMonth(any())).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        service.sendPaymentRemindersForActiveContracts();

        verify(emailService).sendContractPaymentReminderEmail(any(), eq(entity.getId()));
    }

    @Test
    void toGetDTO_nullEntity_returnsNull() {
        assertNull(service.toGetDTO(null));
    }

    @Test
    void mapIncreaseIndex_null_returnsNull() {
        assertNull(ReflectionTestUtils.invokeMethod(service, "mapIncreaseIndex", (IncreaseIndex) null));
    }

    @Test
    void mapCommission_null_returnsNull() {
        assertNull(ReflectionTestUtils.invokeMethod(service, "mapCommission", (Commission) null));
    }

    @Test
    void toSimpleDTO_nullEntity_returnsNull() {
        assertNull(service.toSimpleDTO(null));
    }

    @Test
    void toEntity_nullDTO_returnsNull() {
        assertNull(service.toEntity(null));
    }

    @Test
    void toEntity_withDepositAndGuarantors_success() {
        ContractDTO dto = new ContractDTO();
        dto.setHasDeposit(true);
        dto.setDepositAmount(BigDecimal.TEN);
        dto.setDepositNote("ok");
        dto.setGuarantorsIds(Set.of(1L, 2L));
        Contract entity = service.toEntity(dto);
        assertTrue(entity.isHasDeposit());
    }

    @Test
    void validateDeposit_inconsistent_throws() {
        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateDeposit", true, null, "note"));
    }

    @Test
    void updateStatus_inactivoToActivo_success() {
        entity.setContractStatus(ContractStatus.INACTIVO);
        when(contractRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        ResponseEntity<String> response = service.updateStatus(1L);
        assertEquals("Se ha actualizado el estado del contrato.", response.getBody());
        verify(userRepository).addRoleToUser("user123", "tenant");
    }

    @Test
    void delete_success_noAdminMail() {
        entity.setContractStatus(ContractStatus.ACTIVO);
        when(contractRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        ResponseEntity<String> response = service.delete(1L);

        assertEquals("Se ha eliminado el contrato.", response.getBody());
        verify(contractRepository).deleteById(1L);
        verify(propertyRepository).updateStatus(entity.getPropertyId(), Status.ESPERA);
        verify(userRepository).deleteRoleToUser("user123", "tenant");
        verify(emailService, never()).sendAdminContractExpiredEmail(any());
    }


    @Test
    void getAll_success() {
        when(contractRepository.findAll()).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getAll();
        assertEquals(1, response.getBody().size());
    }

    @Test
    void mapIncreaseIndex_success() {
        IncreaseIndex ii = new IncreaseIndex(10L, "IPC", "Índice de Precios");
        var result = ReflectionTestUtils.invokeMethod(service, "mapIncreaseIndex", ii);
        assertNotNull(result);
    }

    @Test
    void mapContractUtility_withIncreases_success() {
        ContractUtility cu = new ContractUtility();
        cu.setId(5L);
        cu.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);
        cu.setInitialAmount(BigDecimal.TEN);
        cu.setLastPaidAmount(BigDecimal.ONE);
        cu.setLastPaidDate(LocalDate.now().atStartOfDay());
        cu.setNotes("nota");

        Utility u = new Utility();
        u.setId(77L);
        cu.setUtility(u);

        ContractUtilityIncrease inc = new ContractUtilityIncrease();
        inc.setId(88L);
        inc.setAdjustmentDate(LocalDate.now());
        inc.setAmount(BigDecimal.valueOf(999));

        cu.setIncreases(List.of(inc));

        var result = ReflectionTestUtils.invokeMethod(service, "mapContractUtility", cu);

        assertNotNull(result);
    }

    @Test
    void mapContractIncrease_success() {
        ContractIncrease ci = new ContractIncrease();
        ci.setId(11L);
        ci.setDate(LocalDate.now().atStartOfDay());
        ci.setCurrency(PaymentCurrency.ARS);
        ci.setAmount(BigDecimal.valueOf(1000));
        ci.setAdjustment(10);
        ci.setNote("nota");
        ci.setPeriodFrom(LocalDateTime.now().minusMonths(1));
        ci.setPeriodTo(LocalDateTime.now().plusMonths(1));

        IncreaseIndex index = new IncreaseIndex();
        index.setId(22L);
        ci.setIndex(index);

        var result = ReflectionTestUtils.invokeMethod(service, "mapContractIncrease", ci);

        assertNotNull(result);
    }

    @Test
    void mapCommission_success() {
        Commission c = new Commission();
        c.setId(99L);
        c.setCurrency(PaymentCurrency.USD);
        c.setTotalAmount(BigDecimal.valueOf(1234));
        c.setDate(LocalDate.now());
        c.setPaymentType(CommissionPaymentType.CUOTAS);
        c.setInstallments(3);
        c.setStatus(CommissionStatus.PAGADA);
        c.setNote("nota");

        var result = ReflectionTestUtils.invokeMethod(service, "mapCommission", c);

        assertNotNull(result);
    }

    @Test
    void mapPayment_success() {
        Payment p = new Payment();
        p.setId(55L);
        p.setPaymentCurrency(PaymentCurrency.ARS);
        p.setAmount(BigDecimal.valueOf(500));
        p.setDate(LocalDateTime.now());
        p.setDescription("desc");
        p.setConcept(PaymentConcept.ALQUILER);

        ContractUtility cu = new ContractUtility();
        cu.setId(66L);
        p.setContractUtility(cu);

        Commission c = new Commission();
        c.setId(77L);
        p.setCommission(c);

        var result = ReflectionTestUtils.invokeMethod(service, "mapPayment", p);

        assertNotNull(result);
    }

    @Test
    void mapGuarantor_success() {
        Guarantor g = new Guarantor();
        g.setId(44L);
        g.setName("Juan");
        g.setPhone("123");
        g.setEmail("juan@test.com");

        var result = ReflectionTestUtils.invokeMethod(service, "mapGuarantor", g);

        assertNotNull(result);
    }

    @Test
    void toSimpleDTO_success() {
        Contract contract = new Contract();
        contract.setId(1L);
        contract.setUserId("userX");
        contract.setPropertyId(2L);
        contract.setContractType(ContractType.VIVIENDA);
        contract.setStartDate(LocalDate.now());
        contract.setEndDate(LocalDate.now().plusMonths(12));
        contract.setContractStatus(ContractStatus.ACTIVO);
        contract.setCurrency(PaymentCurrency.ARS);
        contract.setInitialAmount(BigDecimal.TEN);
        contract.setAdjustmentFrequencyMonths(12);
        contract.setLastPaidAmount(BigDecimal.ONE);
        contract.setLastPaidDate(LocalDateTime.now());
        contract.setNote("nota");
        contract.setHasDeposit(true);
        contract.setDepositAmount(BigDecimal.valueOf(1000));
        contract.setDepositNote("deposito");

        IncreaseIndex idx = new IncreaseIndex();
        idx.setId(99L);
        contract.setAdjustmentIndex(idx);

        ContractUtility cu = new ContractUtility();
        cu.setId(123L);
        contract.setContractUtilities(Set.of(cu));

        Commission com = new Commission();
        com.setId(321L);
        contract.setCommission(com);

        Payment p = new Payment();
        p.setId(555L);
        contract.setPayments(Set.of(p));

        Guarantor g = new Guarantor();
        g.setId(777L);
        contract.setGuarantors(Set.of(g));

        var result = service.toSimpleDTO(contract);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("userX", result.getUserId());
        assertEquals(99L, result.getAdjustmentIndexId());
        assertEquals(1, result.getContractUtilitiesIds().size());
        assertEquals(321L, result.getCommissionId());
        assertEquals(1, result.getPaymentsIds().size());
        assertTrue(result.getGuarantorsIds().contains(777L));
    }

    @Test
    void getByUserId_success_asAdmin() {
        when(contractRepository.findByUserId("user123")).thenReturn(List.of(entity));

        try (MockedStatic<SecurityUtils> mocked = mockStatic(SecurityUtils.class)) {
            mocked.when(SecurityUtils::isUser).thenReturn(false); // admin bypass
            ResponseEntity<List<ContractGetDTO>> response = service.getByUserId("user123");
            assertEquals(1, response.getBody().size());
            assertEquals(entity.getId(), response.getBody().getFirst().getId());
        }
    }

    @Test
    void getByStatus_success() {
        when(contractRepository.findByStatus(ContractStatus.ACTIVO)).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getByStatus(ContractStatus.ACTIVO);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByType_success() {
        when(contractRepository.findByType(ContractType.VIVIENDA)).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getByType(ContractType.VIVIENDA);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getActiveContracts_success() {
        when(contractRepository.findActiveContracts()).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getActiveContracts();
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByProperty_success() {
        when(contractRepository.findByProperty(100L)).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getByProperty(100L);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByPropertyForMS_success() {
        when(contractRepository.findByPropertyMS(100L)).thenReturn(List.of(entity));
        ResponseEntity<List<ContractSimpleDTO>> response = service.getByPropertyForMS(100L);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByDate_success() {
        LocalDate today = LocalDate.now();
        when(contractRepository.findByDate(today)).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getByDate(today);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByDateRange_success() {
        LocalDate from = LocalDate.now().minusDays(5);
        LocalDate to = LocalDate.now().plusDays(5);
        when(contractRepository.findByDateRange(from, to)).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getByDateRange(from, to);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getContractsExpiringWithin_success() {
        when(contractRepository.findExpiringUntil(any())).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getContractsExpiringWithin(30);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getContractsEndingDate_success() {
        LocalDate date = LocalDate.now().plusMonths(1);
        when(contractRepository.findByExactEndDate(date)).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getContractsEndingDate(date);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getContractsEndingBetween_success() {
        LocalDate from = LocalDate.now();
        LocalDate to = LocalDate.now().plusMonths(2);
        when(contractRepository.findExpiringBetween(from, to)).thenReturn(List.of(entity));
        ResponseEntity<List<ContractGetDTO>> response = service.getContractsEndingBetween(from, to);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void toEntity_withAllFields_success() {
        ContractDTO dto = new ContractDTO();
        dto.setUserId("user123");
        dto.setPropertyId(100L);
        dto.setContractType(ContractType.VIVIENDA);
        dto.setStartDate(LocalDate.now());
        dto.setEndDate(LocalDate.now().plusMonths(12));
        dto.setContractStatus(ContractStatus.ACTIVO);
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setInitialAmount(BigDecimal.valueOf(5000));
        dto.setAdjustmentFrequencyMonths(12);
        dto.setLastPaidAmount(BigDecimal.valueOf(4500));
        dto.setLastPaidDate(LocalDateTime.now());
        dto.setNote("Contrato vigente");

        Contract entity = service.toEntity(dto);

        assertNotNull(entity);
        assertEquals("user123", entity.getUserId());
        assertEquals(100L, entity.getPropertyId());
        assertEquals(ContractType.VIVIENDA, entity.getContractType());
        assertEquals(ContractStatus.ACTIVO, entity.getContractStatus());
        assertEquals(PaymentCurrency.ARS, entity.getCurrency());
        assertEquals(BigDecimal.valueOf(5000), entity.getInitialAmount());
        assertEquals(12, entity.getAdjustmentFrequencyMonths());
        assertEquals(BigDecimal.valueOf(4500), entity.getLastPaidAmount());
        assertNotNull(entity.getLastPaidDate());
        assertEquals("Contrato vigente", entity.getNote());
    }

    // casos de error

    @Test
    void create_indexNotFound_throws() {
        when(increaseIndexRepository.existsById(dto.getAdjustmentIndexId())).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void create_userNotFound_throws() {
        when(increaseIndexRepository.existsById(dto.getAdjustmentIndexId())).thenReturn(true);
        when(userRepository.findById(dto.getUserId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void create_propertyNull_throws() {
        dto.setPropertyId(null);
        when(increaseIndexRepository.existsById(dto.getAdjustmentIndexId())).thenReturn(true);
        when(userRepository.findById(dto.getUserId())).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_propertyNotFound_throws() {
        when(increaseIndexRepository.existsById(dto.getAdjustmentIndexId())).thenReturn(true);
        when(userRepository.findById(dto.getUserId())).thenReturn(Optional.of(user));
        when(propertyRepository.getById(dto.getPropertyId())).thenReturn(null);

        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void update_noId_throws() {
        dto.setId(null);

        assertThrows(IllegalArgumentException.class, () -> service.update(dto));
    }

    @Test
    void update_notFound_throws() {
        when(contractRepository.findById(dto.getId())).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void update_indexNotFound_throws() {
        when(contractRepository.findById(dto.getId())).thenReturn(Optional.of(entity));
        when(increaseIndexRepository.existsById(dto.getAdjustmentIndexId())).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void updateStatus_contractNotFound_throws() {
        when(contractRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.updateStatus(1L));
    }

    @Test
    void delete_notFound_throws() {
        when(contractRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.delete(1L));
    }

    @Test
    void getById_notFound_throws() {
        when(contractRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void updatePropertyStatusAndContract_propertyNotFound_throws() {
        when(propertyRepository.getById(100L)).thenReturn(null);

        assertThrows(EntityNotFoundException.class, () -> service.updatePropertyStatusAndContract(100L, 1L, Status.DISPONIBLE));
    }

    @Test
    void updatePropertyStatusAndContract_contractNotFound_throws() {
        when(propertyRepository.getById(100L)).thenReturn(propertyDTO);
        when(contractRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.updatePropertyStatusAndContract(100L, 1L, Status.DISPONIBLE));
    }

    @Test
    void sendEmailsForContractsWithIncreaseInOneMonth_noUser() {
        ContractIncrease increase = new ContractIncrease();
        increase.setDate(LocalDate.now().minusMonths(1).atStartOfDay());

        entity.setAdjustmentFrequencyMonths(1);
        entity.setContractIncrease(Set.of(increase));
        entity.setAdjustmentIndex(new IncreaseIndex(200L, "IPC", "Índice IPC"));

        when(contractRepository.findAll()).thenReturn(List.of(entity));

        service.sendEmailsForContractsWithIncreaseInOneMonth();

        verify(emailService, never()).sendContractUpcomingIncreaseOneMonthEmail(any(), any());
    }

    @Test
    void sendAdminContractsWithIncreaseInOneMonth_noUser() {
        ContractIncrease increase = new ContractIncrease();
        increase.setDate(LocalDate.now().minusMonths(1).atStartOfDay());

        entity.setAdjustmentFrequencyMonths(1);
        entity.setContractIncrease(Set.of(increase));
        entity.setAdjustmentIndex(new IncreaseIndex(200L, "IPC", "Índice IPC"));

        when(contractRepository.findAll()).thenReturn(List.of(entity));

        service.sendAdminContractsWithIncreaseInOneMonth();

        verify(emailService, never()).sendAdminContractUpcomingIncreaseListEmail(any());
    }

    @Test
    void sendEmailsForContractsExpiringInOneMonth_noUser() {
        entity.setEndDate(LocalDate.now().plusMonths(1));

        when(contractRepository.findContractsExpiringInOneMonth(any())).thenReturn(List.of(entity));

        service.sendEmailsForContractsExpiringInOneMonth();

        verify(emailService, never()).sendContractExpiringSoonEmail(any(), any());
        verify(emailService).sendAdminContractsExpiringSoonListEmail(any());
    }

    @Test
    void sendPaymentRemindersForActiveContracts_noUser() {
        entity.setInitialAmount(BigDecimal.valueOf(5000));
        entity.setCurrency(PaymentCurrency.ARS);

        when(contractRepository.findActiveContractsNotExpiringNextMonth(any())).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        service.sendPaymentRemindersForActiveContracts();

        verify(emailService, never()).sendContractPaymentReminderEmail(any(), any());
    }

    @Test
    void getByUserId_accessDenied_throws() {
        try (MockedStatic<SecurityUtils> mocked = mockStatic(SecurityUtils.class)) {
            mocked.when(SecurityUtils::isUser).thenReturn(true);
            mocked.when(SecurityUtils::getCurrentUserId).thenReturn("someOtherUser");

            assertThrows(AccessDeniedException.class, () -> service.getByUserId("otherUser"));
        }
    }

    @Test
    void getContractsWithIncreaseInOneMonth_empty() {
        when(contractRepository.findAll()).thenReturn(List.of(entity));
        List<Contract> result = service.getContractsWithIncreaseInOneMonth();
        assertTrue(result.isEmpty());
    }

    @Test
    void sendAdminContractsWithIncreaseInOneMonth_emptyList_noEmail() {
        when(contractRepository.findAll()).thenReturn(List.of());
        service.sendAdminContractsWithIncreaseInOneMonth();
        verify(emailService, never()).sendAdminContractUpcomingIncreaseListEmail(any());
    }

    @Test
    void getByUserId_accessDenied_whenDifferentUser() {
        try (MockedStatic<SecurityUtils> mocked = mockStatic(SecurityUtils.class)) {
            mocked.when(SecurityUtils::isUser).thenReturn(true);
            mocked.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");
            assertThrows(AccessDeniedException.class, () -> service.getByUserId("user123"));
        }
    }

    @Test
    void getByUserId_success_sameUser() {
        when(contractRepository.findByUserId("user123")).thenReturn(List.of(entity));

        try (MockedStatic<SecurityUtils> mocked = mockStatic(SecurityUtils.class)) {
            mocked.when(SecurityUtils::isUser).thenReturn(true);
            mocked.when(SecurityUtils::getCurrentUserId).thenReturn("user123");

            ResponseEntity<List<ContractGetDTO>> response = service.getByUserId("user123");
            assertEquals(1, response.getBody().size());
            assertEquals(entity.getId(), response.getBody().getFirst().getId());
        }
    }

    @Test
    void toEntity_withNullFields_doesNotOverride() {
        Contract entity = new Contract();
        entity.setUserId("existingUser");
        entity.setPropertyId(99L);
        entity.setNote("nota existente");

        ContractDTO dto = new ContractDTO();

        Contract result = service.toEntity(dto);

        assertEquals(null, result.getUserId());
    }
}