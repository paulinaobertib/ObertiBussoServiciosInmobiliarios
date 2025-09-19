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
import pi.ms_users.dto.ContractUtilityDTO;
import pi.ms_users.dto.ContractUtilityGetDTO;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IContractUtilityRepository;
import pi.ms_users.repository.IUtilityRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.impl.ContractUtilityService;
import pi.ms_users.service.interf.IEmailService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractUtilityServiceTest {

    @InjectMocks
    private ContractUtilityService service;

    @Mock
    private IContractUtilityRepository contractUtilityRepository;

    @Mock
    private IContractRepository contractRepository;

    @Mock
    private IUtilityRepository utilityRepository;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private IEmailService emailService;

    @Mock
    private EntityManager em;

    private ContractUtilityDTO dto;
    private ContractUtility entity;
    private Contract contract;
    private Utility utility;
    private User user;

    @BeforeEach
    void setUp() {
        dto = new ContractUtilityDTO();
        dto.setId(1L);
        dto.setContractId(10L);
        dto.setUtilityId(20L);

        entity = new ContractUtility();
        entity.setId(1L);

        contract = new Contract();
        contract.setId(10L);
        contract.setUserId("user123");

        utility = new Utility();
        utility.setId(20L);

        user = new User();
        user.setId("user123");
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setEmail("juan@test.com");
    }

    @BeforeEach
    void init() {
        ReflectionTestUtils.setField(service, "em", em);
    }

    // casos de exito

    @Test
    void create_success() {
        dto.setId(null);
        when(contractRepository.findById(10L)).thenReturn(Optional.of(contract));
        when(utilityRepository.findById(20L)).thenReturn(Optional.of(utility));
        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(Utility.class, 20L)).thenReturn(utility);

        ResponseEntity<String> response = service.create(dto);

        assertEquals("Se ha guardado el servicio del contrato.", response.getBody());
        verify(contractUtilityRepository).save(any());
    }

    @Test
    void update_success() {
        when(contractUtilityRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(utilityRepository.existsById(20L)).thenReturn(true);
        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(Utility.class, 20L)).thenReturn(utility);

        ResponseEntity<String> response = service.update(dto);

        assertEquals("Se ha actualizado el servicio del contrato.", response.getBody());
        verify(contractUtilityRepository).save(any());
    }

    @Test
    void delete_success() {
        when(contractUtilityRepository.existsById(1L)).thenReturn(true);

        ResponseEntity<String> response = service.delete(1L);

        assertEquals("Se ha eliminado el servicio del contrato.", response.getBody());
        verify(contractUtilityRepository).deleteById(1L);
    }

    @Test
    void deleteByContract_success() {
        when(contractRepository.existsById(10L)).thenReturn(true);

        ResponseEntity<String> response = service.deleteByContract(10L);

        assertEquals("Se han eliminado los servicios del contrato.", response.getBody());
        verify(contractUtilityRepository).deleteByContractId(10L);
    }

    @Test
    void getById_success() {
        entity.setContract(contract);
        entity.setUtility(utility);
        when(contractUtilityRepository.findDetailedById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<ContractUtilityGetDTO> response = service.getById(1L);

        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getByContract_success() {
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(contractUtilityRepository.findDetailedByContractId(10L)).thenReturn(List.of(entity));

        ResponseEntity<List<ContractUtilityGetDTO>> response = service.getByContract(10L);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByUtility_success() {
        when(utilityRepository.existsById(20L)).thenReturn(true);
        when(contractUtilityRepository.findDetailedByUtilityId(20L)).thenReturn(List.of(entity));

        ResponseEntity<List<ContractUtilityGetDTO>> response = service.getByUtility(20L);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByPeriodicity_success() {
        entity.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);
        when(contractUtilityRepository.findDetailedByPeriodicity(UtilityPeriodicityPayment.MENSUAL))
                .thenReturn(List.of(entity));

        ResponseEntity<List<ContractUtilityGetDTO>> response =
                service.getByPeriodicity(UtilityPeriodicityPayment.MENSUAL);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getUtilitiesDueInTenDays_success() {
        LocalDate targetDate = LocalDate.now().plusDays(10);
        LocalDate lastPaid = targetDate.minusMonths(1);

        entity.setLastPaidDate(lastPaid.atStartOfDay());
        entity.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);

        when(contractUtilityRepository.findAll()).thenReturn(List.of(entity));

        List<ContractUtility> result = service.getUtilitiesDueInTenDays();

        assertEquals(1, result.size());
    }

    @Test
    void sendAdminUtilitiesDueInTenDays_success() {
        LocalDate targetDate = LocalDate.now().plusDays(10);
        LocalDate lastPaid = targetDate.minusMonths(1);

        entity.setLastPaidDate(lastPaid.atStartOfDay());
        entity.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);

        contract.setId(10L);
        contract.setUserId("user123");
        entity.setContract(contract);

        utility.setId(20L);
        utility.setName("Luz");
        entity.setUtility(utility);

        user.setId("user123");
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setEmail("juan@test.com");

        when(contractUtilityRepository.findAll()).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        service.sendAdminUtilitiesDueInTenDays();

        verify(emailService).sendAdminUtilityUpcomingChargeListEmail(any());
    }

    @Test
    void sendEmailsForUtilitiesDueInTenDays_success() {
        LocalDate targetDate = LocalDate.now().plusDays(10);
        LocalDate lastPaid = targetDate.minusMonths(1);

        entity.setLastPaidDate(lastPaid.atStartOfDay());
        entity.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);
        entity.setContract(contract);
        entity.setUtility(utility);

        when(contractUtilityRepository.findAll()).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        service.sendEmailsForUtilitiesDueInTenDays();

        verify(emailService).sendUtilityPaymentReminderEmail(any(), eq(10L));
    }

    @Test
    void toEntity_withReferences_setsContractAndUtility() {
        dto.setId(5L);
        dto.setContractId(10L);
        dto.setUtilityId(20L);

        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(Utility.class, 20L)).thenReturn(utility);

        ContractUtility result = service.toEntity(dto);

        assertEquals(5L, result.getId());
        assertNotNull(result.getContract());
        assertNotNull(result.getUtility());
    }

    @Test
    void toGetDTO_withIncreases_mapsCorrectly() {
        ContractUtilityIncrease inc = new ContractUtilityIncrease();
        inc.setId(99L);
        inc.setAdjustmentDate(LocalDate.now());
        inc.setAmount(java.math.BigDecimal.TEN);
        entity.setIncreases(List.of(inc));

        ContractUtilityGetDTO result = service.toGetDTO(entity);

        assertEquals(1, result.getIncreases().size());
        assertEquals(99L, result.getIncreases().get(0).getId());
    }

    @Test
    void getUtilitiesDueInTenDays_allPeriodicities() {
        LocalDate lastPaid = LocalDate.now().plusDays(10).minusMonths(1);
        entity.setLastPaidDate(lastPaid.atStartOfDay());

        for (UtilityPeriodicityPayment p : UtilityPeriodicityPayment.values()) {
            entity.setPeriodicity(p);
            when(contractUtilityRepository.findAll()).thenReturn(List.of(entity));

            service.getUtilitiesDueInTenDays();
        }

        verify(contractUtilityRepository, atLeastOnce()).findAll();
    }

    @Test
    void toEntity_withAllSimpleFields_setsValues() {
        dto.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);
        dto.setInitialAmount(java.math.BigDecimal.TEN);
        dto.setLastPaidAmount(java.math.BigDecimal.ONE);
        dto.setLastPaidDate(LocalDate.now().atStartOfDay());
        dto.setNotes("nota de prueba");

        ContractUtility result = service.toEntity(dto);

        assertEquals(UtilityPeriodicityPayment.MENSUAL, result.getPeriodicity());
        assertEquals(java.math.BigDecimal.TEN, result.getInitialAmount());
        assertEquals(java.math.BigDecimal.ONE, result.getLastPaidAmount());
        assertNotNull(result.getLastPaidDate());
        assertEquals("nota de prueba", result.getNotes());
    }

    @Test
    void update_contractIdChangedAndFound_updatesReference() {
        entity.setContract(contract);
        when(contractUtilityRepository.findById(1L)).thenReturn(Optional.of(entity));

        dto.setContractId(999L);
        Contract newContract = new Contract();
        newContract.setId(999L);

        when(contractRepository.existsById(999L)).thenReturn(true);
        when(em.getReference(Contract.class, 999L)).thenReturn(newContract);
        when(utilityRepository.existsById(20L)).thenReturn(true);
        when(em.getReference(Utility.class, 20L)).thenReturn(utility);

        ResponseEntity<String> response = service.update(dto);

        assertEquals("Se ha actualizado el servicio del contrato.", response.getBody());
        assertEquals(999L, entity.getContract().getId());
    }

    @Test
    void update_utilityIdChangedAndFound_updatesReference() {
        entity.setUtility(utility);
        when(contractUtilityRepository.findById(1L)).thenReturn(Optional.of(entity));

        dto.setUtilityId(888L);
        Utility newUtility = new Utility();
        newUtility.setId(888L);

        when(utilityRepository.existsById(888L)).thenReturn(true);
        when(em.getReference(Utility.class, 888L)).thenReturn(newUtility);
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(em.getReference(Contract.class, 10L)).thenReturn(contract);

        ResponseEntity<String> response = service.update(dto);

        assertEquals("Se ha actualizado el servicio del contrato.", response.getBody());
        assertEquals(888L, entity.getUtility().getId());
    }

    // casos de error

    @Test
    void create_missingContractId_throwsBadRequest() {
        dto.setContractId(null);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_missingUtilityId_throwsBadRequest() {
        dto.setUtilityId(null);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_contractNotFound_throwsEntityNotFound() {
        dto.setId(null);
        when(contractRepository.findById(10L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void create_utilityNotFound_throwsEntityNotFound() {
        dto.setId(null);
        when(contractRepository.findById(10L)).thenReturn(Optional.of(contract));
        when(utilityRepository.findById(20L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void update_missingId_throwsBadRequest() {
        dto.setId(null);
        assertThrows(BadRequestException.class, () -> service.update(dto));
    }

    @Test
    void update_entityNotFound_throwsEntityNotFound() {
        when(contractUtilityRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void delete_notFound_throwsEntityNotFound() {
        when(contractUtilityRepository.existsById(1L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.delete(1L));
    }

    @Test
    void deleteByContract_notFound_throwsEntityNotFound() {
        when(contractRepository.existsById(10L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.deleteByContract(10L));
    }

    @Test
    void getById_notFound_throwsEntityNotFound() {
        when(contractUtilityRepository.findDetailedById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void getByContract_notFound_throwsEntityNotFound() {
        when(contractRepository.existsById(10L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.getByContract(10L));
    }

    @Test
    void getByUtility_notFound_throwsEntityNotFound() {
        when(utilityRepository.existsById(20L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.getByUtility(20L));
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
    void validateBusiness_negativeInitialAmount_throws() {
        dto.setInitialAmount(java.math.BigDecimal.valueOf(-1));
        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateBusiness", dto));
    }

    @Test
    void validateBusiness_negativeLastPaidAmount_throws() {
        dto.setLastPaidAmount(java.math.BigDecimal.valueOf(-5));
        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateBusiness", dto));
    }

    @Test
    void update_contractIdChangedAndNotFound_throws() {
        entity.setContract(contract);
        when(contractUtilityRepository.findById(1L)).thenReturn(Optional.of(entity));
        dto.setContractId(999L);

        when(contractRepository.existsById(999L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void sendAdminUtilitiesDueInTenDays_noUserFound_stillSendsBecauseNullInList() {
        entity.setLastPaidDate(LocalDate.now().plusDays(10).minusMonths(1).atStartOfDay());
        entity.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);
        entity.setContract(contract);
        entity.setUtility(utility);

        when(contractUtilityRepository.findAll()).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        service.sendAdminUtilitiesDueInTenDays();

        verify(emailService).sendAdminUtilityUpcomingChargeListEmail(any());
    }

    @Test
    void sendEmailsForUtilitiesDueInTenDays_noUserFound_doesNotSend() {
        entity.setLastPaidDate(LocalDate.now().plusDays(10).minusMonths(1).atStartOfDay());
        entity.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);
        entity.setContract(contract);
        entity.setUtility(utility);

        when(contractUtilityRepository.findAll()).thenReturn(List.of(entity));
        when(userRepository.findById("user123")).thenReturn(Optional.empty());

        service.sendEmailsForUtilitiesDueInTenDays();

        verify(emailService, never()).sendUtilityPaymentReminderEmail(any(), anyLong());
    }
}