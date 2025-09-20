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
import pi.ms_users.dto.PaymentDTO;
import pi.ms_users.repository.*;
import pi.ms_users.service.impl.PaymentService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static pi.ms_users.domain.PaymentConcept.*;
import static pi.ms_users.domain.PaymentCurrency.ARS;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private IPaymentRepository paymentRepository;

    @Mock
    private IContractRepository contractRepository;

    @Mock
    private IContractUtilityRepository contractUtilityRepository;

    @Mock
    private ICommissionRepository commissionRepository;

    @Mock
    private EntityManager em;

    @InjectMocks
    private PaymentService service;

    private Payment entity;
    private PaymentDTO dto;
    private Contract contract;
    private ContractUtility contractUtility;
    private Commission commission;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "em", em);

        contract = new Contract();
        contract.setId(10L);

        contractUtility = new ContractUtility();
        contractUtility.setId(20L);
        contractUtility.setContract(contract);

        commission = new Commission();
        commission.setId(30L);
        commission.setContract(contract);

        entity = new Payment();
        entity.setId(1L);
        entity.setPaymentCurrency(ARS);
        entity.setAmount(BigDecimal.TEN);
        entity.setDate(LocalDateTime.now());
        entity.setDescription("Pago test");
        entity.setConcept(ALQUILER);
        entity.setContract(contract);

        dto = new PaymentDTO();
        dto.setId(1L);
        dto.setPaymentCurrency(ARS);
        dto.setAmount(BigDecimal.TEN);
        dto.setDate(LocalDateTime.now());
        dto.setDescription("Pago test");
        dto.setConcept(ALQUILER);
        dto.setContractId(10L);
    }

    // casos de exito

    @Test
    void toDTO_and_toEntity_success() {
        entity.setContractUtility(contractUtility);
        entity.setCommission(commission);

        PaymentDTO result = service.toDTO(entity);
        assertEquals(entity.getId(), result.getId());

        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(ContractUtility.class, 20L)).thenReturn(contractUtility);
        when(em.getReference(Commission.class, 30L)).thenReturn(commission);

        dto.setContractUtilityId(20L);
        dto.setCommissionId(30L);

        Payment converted = service.toEntity(dto);
        assertEquals(dto.getId(), converted.getId());
    }

    @Test
    void toDTO_null_returnsNull() {
        assertNull(service.toDTO(null));
    }

    @Test
    void toEntity_null_returnsNull() {
        assertNull(service.toEntity(null));
    }

    @Test
    void create_success_alquiler() {
        dto.setId(null);
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(em.getReference(Contract.class, 10L)).thenReturn(contract);

        ResponseEntity<String> response = service.create(dto);

        assertEquals("Se ha creado el pago.", response.getBody());
        verify(paymentRepository).save(any());
        verify(contractRepository).save(contract);
    }

    @Test
    void create_success_extra() {
        dto.setId(null);
        dto.setConcept(EXTRA);
        dto.setContractUtilityId(20L);

        when(contractRepository.existsById(10L)).thenReturn(true);
        when(contractUtilityRepository.existsById(20L)).thenReturn(true);
        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(ContractUtility.class, 20L)).thenReturn(contractUtility);

        ResponseEntity<String> response = service.create(dto);

        assertEquals("Se ha creado el pago.", response.getBody());
    }

    @Test
    void update_success() {
        when(paymentRepository.existsById(1L)).thenReturn(true);
        when(contractRepository.existsById(10L)).thenReturn(true);

        ResponseEntity<String> response = service.update(dto);

        assertEquals("Se ha actualizado el pago.", response.getBody());
    }

    @Test
    void delete_success() {
        when(paymentRepository.existsById(1L)).thenReturn(true);

        ResponseEntity<String> response = service.delete(1L);

        assertEquals("Se ha eliminado el pago.", response.getBody());
    }

    @Test
    void getById_success() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<PaymentDTO> response = service.getById(1L);

        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getByContract_success() {
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(paymentRepository.findByContractId(10L)).thenReturn(List.of(entity));

        ResponseEntity<List<PaymentDTO>> response = service.getByContract(10L);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByContractUtility_success() {
        when(contractUtilityRepository.existsById(20L)).thenReturn(true);
        when(paymentRepository.findByContractUtilityId(20L)).thenReturn(List.of(entity));

        ResponseEntity<List<PaymentDTO>> response = service.getByContractUtility(20L);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByCommission_success() {
        when(commissionRepository.existsById(30L)).thenReturn(true);
        when(paymentRepository.findByCommissionId(30L)).thenReturn(List.of(entity));

        ResponseEntity<List<PaymentDTO>> response = service.getByCommission(30L);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getLastByContract_success() {
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(paymentRepository.findLastByContractId(10L)).thenReturn(Optional.of(entity));

        ResponseEntity<PaymentDTO> response = service.getLastByContract(10L);
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getLastByContractUtility_success() {
        when(contractUtilityRepository.existsById(20L)).thenReturn(true);
        when(paymentRepository.findLastByContractUtilityId(20L)).thenReturn(Optional.of(entity));

        ResponseEntity<PaymentDTO> response = service.getLastByContractUtility(20L);
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getLastByCommission_success() {
        when(commissionRepository.existsById(30L)).thenReturn(true);
        when(paymentRepository.findLastByCommissionId(30L)).thenReturn(Optional.of(entity));

        ResponseEntity<PaymentDTO> response = service.getLastByCommission(30L);
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getByDateRange_success() {
        LocalDateTime from = LocalDateTime.now().minusDays(1);
        LocalDateTime to = LocalDateTime.now().plusDays(1);

        when(paymentRepository.findByDateRange(from, to)).thenReturn(List.of(entity));

        ResponseEntity<List<PaymentDTO>> response = service.getByDateRange(from, to);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByConcept_success() {
        when(paymentRepository.findByConcept(ALQUILER)).thenReturn(List.of(entity));

        ResponseEntity<List<PaymentDTO>> response = service.getByConcept(ALQUILER);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByCurrency_success() {
        when(paymentRepository.findByCurrency(ARS)).thenReturn(List.of(entity));

        ResponseEntity<List<PaymentDTO>> response = service.getByCurrency(ARS);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void create_success_comision() {
        dto.setId(null);
        dto.setConcept(COMISION);
        dto.setCommissionId(30L);

        when(contractRepository.existsById(10L)).thenReturn(true);
        when(commissionRepository.existsById(30L)).thenReturn(true);
        when(em.getReference(Contract.class, 10L)).thenReturn(contract);
        when(em.getReference(Commission.class, 30L)).thenReturn(commission);

        ResponseEntity<String> response = service.create(dto);

        assertEquals("Se ha creado el pago.", response.getBody());
        verify(paymentRepository).save(any());
    }

    @Test
    void updateLastPaidForContract_withPayment_setsValues() {
        Payment last = new Payment();
        last.setAmount(BigDecimal.ONE);
        last.setDate(LocalDateTime.now());

        when(paymentRepository.findTopByContractAndConceptOrderByDateDesc(eq(contract), eq(ALQUILER)))
                .thenReturn(Optional.of(last));

        ReflectionTestUtils.invokeMethod(service, "updateLastPaidForContract", contract);
        assertEquals(BigDecimal.ONE, contract.getLastPaidAmount());
    }

    @Test
    void updateLastPaidForUtility_withPayment_setsValues() {
        Payment last = new Payment();
        last.setAmount(BigDecimal.ONE);
        last.setDate(LocalDateTime.now());

        when(paymentRepository.findTopByContractUtilityAndConceptOrderByDateDesc(eq(contractUtility), eq(EXTRA)))
                .thenReturn(Optional.of(last));

        ReflectionTestUtils.invokeMethod(service, "updateLastPaidForUtility", contractUtility);
        assertEquals(BigDecimal.ONE, contractUtility.getLastPaidAmount());
    }

    @Test
    void getByDateRangeAndContract_success() {
        LocalDateTime from = LocalDateTime.now().minusDays(1);
        LocalDateTime to = LocalDateTime.now().plusDays(1);
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(paymentRepository.findByDateRangeAndContract(10L, from, to)).thenReturn(List.of(entity));

        ResponseEntity<List<PaymentDTO>> response = service.getByDateRangeAndContract(10L, from, to);
        assertEquals(1, response.getBody().size());
    }

    // casos de error

    @Test
    void create_withId_throws() {
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void update_nullId_throws() {
        dto.setId(null);
        assertThrows(BadRequestException.class, () -> service.update(dto));
    }

    @Test
    void update_notFound_throws() {
        when(paymentRepository.existsById(1L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.update(dto));
    }

    @Test
    void delete_notFound_throws() {
        when(paymentRepository.existsById(1L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.delete(1L));
    }

    @Test
    void getById_notFound_throws() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getById(1L));
    }

    @Test
    void getByContract_notFound_throws() {
        when(contractRepository.existsById(10L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.getByContract(10L));
    }

    @Test
    void getByContractUtility_notFound_throws() {
        when(contractUtilityRepository.existsById(20L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.getByContractUtility(20L));
    }

    @Test
    void getByCommission_notFound_throws() {
        when(commissionRepository.existsById(30L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.getByCommission(30L));
    }

    @Test
    void getLastByContract_notFound_throws() {
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(paymentRepository.findLastByContractId(10L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getLastByContract(10L));
    }

    @Test
    void getByDateRange_invalidRange_throws() {
        LocalDateTime from = LocalDateTime.now();
        LocalDateTime to = from.minusDays(1);
        assertThrows(BadRequestException.class, () -> service.getByDateRange(from, to));
    }

    @Test
    void create_missingContractId_throws() {
        dto.setId(null);
        dto.setContractId(null);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_missingCurrency_throws() {
        dto.setId(null);
        dto.setPaymentCurrency(null);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_invalidAmount_throws() {
        dto.setId(null);
        dto.setAmount(BigDecimal.ZERO);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_missingDate_throws() {
        dto.setId(null);
        dto.setDate(null);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_missingConcept_throws() {
        dto.setId(null);
        dto.setConcept(null);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_comisionWithoutId_throws() {
        dto.setId(null);
        dto.setConcept(COMISION);
        dto.setCommissionId(null);
        when(contractRepository.existsById(10L)).thenReturn(true);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_extraWithoutUtility_throws() {
        dto.setId(null);
        dto.setConcept(EXTRA);
        dto.setContractUtilityId(null);
        when(contractRepository.existsById(10L)).thenReturn(true);
        assertThrows(BadRequestException.class, () -> service.create(dto));
    }

    @Test
    void create_alquilerWithUtility_throws() {
        dto.setId(null);
        dto.setConcept(ALQUILER);

        Payment entityWithUtility = new Payment();
        entityWithUtility.setConcept(ALQUILER);
        entityWithUtility.setContractUtility(new ContractUtility());

        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateConceptRules", dto, entityWithUtility));
    }

    @Test
    void create_extraWithWrongContract_throws() {
        dto.setId(null);
        dto.setConcept(EXTRA);
        dto.setContractId(10L);

        Contract otherContract = new Contract();
        otherContract.setId(99L);
        ContractUtility cu = new ContractUtility();
        cu.setContract(otherContract);

        Payment entityWithUtility = new Payment();
        entityWithUtility.setConcept(EXTRA);
        entityWithUtility.setContractUtility(cu);

        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateConceptRules", dto, entityWithUtility));
    }

    @Test
    void create_comisionWithWrongContract_throws() {
        dto.setId(null);
        dto.setConcept(COMISION);
        dto.setContractId(10L);

        Contract otherContract = new Contract();
        otherContract.setId(99L);
        Commission wrongCom = new Commission();
        wrongCom.setContract(otherContract);

        Payment entityWithCom = new Payment();
        entityWithCom.setConcept(COMISION);
        entityWithCom.setCommission(wrongCom);

        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateConceptRules", dto, entityWithCom));
    }

    @Test
    void updateLastPaidForContract_withoutPayment_setsNull() {
        when(paymentRepository.findTopByContractAndConceptOrderByDateDesc(eq(contract), eq(ALQUILER)))
                .thenReturn(Optional.empty());

        ReflectionTestUtils.invokeMethod(service, "updateLastPaidForContract", contract);
        assertNull(contract.getLastPaidAmount());
    }

    @Test
    void updateLastPaidForUtility_withoutPayment_setsNull() {
        when(paymentRepository.findTopByContractUtilityAndConceptOrderByDateDesc(eq(contractUtility), eq(EXTRA)))
                .thenReturn(Optional.empty());

        ReflectionTestUtils.invokeMethod(service, "updateLastPaidForUtility", contractUtility);
        assertNull(contractUtility.getLastPaidAmount());
    }

    @Test
    void getByDateRange_nullFrom_throws() {
        assertThrows(BadRequestException.class, () -> service.getByDateRange(null, LocalDateTime.now()));
    }

    @Test
    void getByDateRange_nullTo_throws() {
        assertThrows(BadRequestException.class, () -> service.getByDateRange(LocalDateTime.now(), null));
    }

    @Test
    void getByDateRangeAndContract_notFound_throws() {
        when(contractRepository.existsById(10L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () ->
                service.getByDateRangeAndContract(10L, LocalDateTime.now().minusDays(1), LocalDateTime.now()));
    }

    @Test
    void create_contractNotFound_throws() {
        dto.setId(null);
        when(contractRepository.existsById(10L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void create_invalidCommissionId_throws() {
        dto.setId(null);
        dto.setConcept(COMISION);
        dto.setCommissionId(99L);
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(commissionRepository.existsById(99L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void create_invalidUtilityId_throws() {
        dto.setId(null);
        dto.setConcept(EXTRA);
        dto.setContractUtilityId(99L);
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(contractUtilityRepository.existsById(99L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void validateConceptRules_missingContractId_throws() {
        dto.setContractId(null);
        Payment entityWithConcept = new Payment();
        entityWithConcept.setConcept(ALQUILER);
        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateConceptRules", dto, entityWithConcept));
    }

    @Test
    void validateConceptRules_alquilerWithCommission_throws() {
        dto.setConcept(ALQUILER);
        Payment entityWithCom = new Payment();
        entityWithCom.setConcept(ALQUILER);
        entityWithCom.setCommission(new Commission());
        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateConceptRules", dto, entityWithCom));
    }

    @Test
    void validateConceptRules_extraWithCommission_throws() {
        dto.setConcept(EXTRA);
        Payment entityWithCom = new Payment();
        entityWithCom.setConcept(EXTRA);
        entityWithCom.setCommission(new Commission());
        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateConceptRules", dto, entityWithCom));
    }

    @Test
    void validateConceptRules_comisionWithUtility_throws() {
        dto.setConcept(COMISION);
        Payment entityWithUtility = new Payment();
        entityWithUtility.setConcept(COMISION);
        entityWithUtility.setContractUtility(new ContractUtility());
        assertThrows(BadRequestException.class, () ->
                ReflectionTestUtils.invokeMethod(service, "validateConceptRules", dto, entityWithUtility));
    }

    @Test
    void getLastByContractUtility_notFound_throws() {
        when(contractUtilityRepository.existsById(20L)).thenReturn(true);
        when(paymentRepository.findLastByContractUtilityId(20L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getLastByContractUtility(20L));
    }

    @Test
    void getLastByCommission_notFound_throws() {
        when(commissionRepository.existsById(30L)).thenReturn(true);
        when(paymentRepository.findLastByCommissionId(30L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> service.getLastByCommission(30L));
    }

    @Test
    void getByDateRangeAndUtility_notFound_throws() {
        when(contractUtilityRepository.existsById(20L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () ->
                service.getByDateRangeAndUtility(20L, LocalDateTime.now().minusDays(1), LocalDateTime.now()));
    }

    @Test
    void getByDateRangeAndCommission_notFound_throws() {
        when(commissionRepository.existsById(30L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () ->
                service.getByDateRangeAndCommission(30L, LocalDateTime.now().minusDays(1), LocalDateTime.now()));
    }
}