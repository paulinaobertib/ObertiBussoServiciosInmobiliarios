package pi.ms_users.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.*;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IPaymentRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.impl.PaymentService;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private IPaymentRepository paymentRepository;

    @Mock
    private IContractRepository contractRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Contract contract;

    private Payment payment;

    @BeforeEach
    void setUp() {
        contract = new Contract();
        contract.setId(1L);

        payment = new Payment();
        payment.setId(100L);
        payment.setAmount(BigDecimal.valueOf(1500));
        payment.setDate(LocalDateTime.now());
        payment.setDescription("Pago prueba");
        payment.setPaymentCurrency(PaymentCurrency.USD);
        payment.setContract(contract);
    }

    // casos de exito

    @Test
    void createPayment_shouldSaveAndReturnOk() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(paymentRepository.save(payment)).thenReturn(payment);

        ResponseEntity<String> response = paymentService.createPayment(payment);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha guardado el pago", response.getBody());
        verify(paymentRepository).save(payment);
    }

    @Test
    void updatePayment_shouldUpdateAndReturnOk() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));
        when(paymentRepository.save(payment)).thenReturn(payment);

        ResponseEntity<String> response = paymentService.updatePayment(payment);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha actualizado el pago", response.getBody());
        verify(paymentRepository).save(payment);
    }

    @Test
    void deletePayment_shouldDeleteAndReturnOk() {
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));

        ResponseEntity<String> response = paymentService.deletePayment(payment.getId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado el pago", response.getBody());
        verify(paymentRepository).delete(payment);
    }

    @Test
    void getById_shouldReturnPayment() {
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));

        ResponseEntity<Payment> response = paymentService.getById(payment.getId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(payment, response.getBody());
    }

    @Test
    void getByContractId_shouldReturnList() {
        List<Payment> payments = List.of(payment);
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(paymentRepository.findByContractId(contract.getId())).thenReturn(payments);

        ResponseEntity<List<Payment>> response = paymentService.getByContractId(contract.getId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(payments, response.getBody());
    }

    @Test
    void getByDate_shouldReturnList() {
        List<Payment> payments = List.of(payment);
        LocalDateTime date = LocalDateTime.now();

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(paymentRepository.findByDate(contract.getId(), date)).thenReturn(payments);

        ResponseEntity<List<Payment>> response = paymentService.getByDate(contract.getId(), date);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(payments, response.getBody());
    }

    @Test
    void getByDateBetween_shouldReturnList() {
        List<Payment> payments = List.of(payment);
        LocalDateTime start = LocalDateTime.now().minusDays(5);
        LocalDateTime end = LocalDateTime.now();

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(paymentRepository.findByDateBetween(contract.getId(), start, end)).thenReturn(payments);

        ResponseEntity<List<Payment>> response = paymentService.getByDateBetween(contract.getId(), start, end);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(payments, response.getBody());
    }

    // casos de error

    @Test
    void createPayment_contractNotFound_shouldThrow() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            paymentService.createPayment(payment));

        assertEquals("No se ha encontrado el contrato", ex.getMessage());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void updatePayment_contractNotFound_shouldThrow() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            paymentService.updatePayment(payment));

        assertEquals("No se ha encontrado el contrato", ex.getMessage());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void updatePayment_paymentNotFound_shouldThrow() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            paymentService.updatePayment(payment));

        assertEquals("No se ha encontrado el pago que se solicita editar", ex.getMessage());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void deletePayment_paymentNotFound_shouldThrow() {
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            paymentService.deletePayment(payment.getId()));

        assertEquals("No se ha encontrado el pago que se solicita eliminar", ex.getMessage());
        verify(paymentRepository, never()).delete(any());
    }

    @Test
    void getById_paymentNotFound_shouldThrow() {
        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            paymentService.getById(payment.getId()));

        assertEquals("No se ha encontrado el pago solicitado", ex.getMessage());
    }

    @Test
    void getByContractId_contractNotFound_shouldThrow() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            paymentService.getByContractId(contract.getId()));

        assertEquals("No se ha encontrado el contrato", ex.getMessage());
    }

    @Test
    void getByDate_contractNotFound_shouldThrow() {
        LocalDateTime date = LocalDateTime.now();
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            paymentService.getByDate(contract.getId(), date));

        assertEquals("No se ha encontrado el contrato", ex.getMessage());
    }

    @Test
    void getByDateBetween_contractNotFound_shouldThrow() {
        LocalDateTime start = LocalDateTime.now().minusDays(5);
        LocalDateTime end = LocalDateTime.now();
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            paymentService.getByDateBetween(contract.getId(), start, end));
        assertEquals("No se ha encontrado el contrato", ex.getMessage());
    }

    @Test
    void getById_shouldThrowAccessDeniedException_whenUserIsTenantAndNotOwner() {
        payment.getContract().setUserId("user-id");

        when(paymentRepository.findById(payment.getId())).thenReturn(Optional.of(payment));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isTenant).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("user-ok");

            assertThrows(AccessDeniedException.class, () -> paymentService.getById(payment.getId()));
        }
    }

    @Test
    void getByContractId_shouldThrowAccessDeniedException_whenUserIsTenantAndNotOwner() {
        contract.setUserId("user-id");

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isTenant).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("user-ok");

            assertThrows(AccessDeniedException.class, () -> paymentService.getByContractId(contract.getId()));
        }
    }

    @Test
    void getByDate_shouldThrowAccessDeniedException_whenUserIsTenantAndNotOwner() {
        contract.setUserId("user-id");

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isTenant).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("user-ok");

            assertThrows(AccessDeniedException.class, () -> paymentService.getByDate(contract.getId(), LocalDateTime.now()));
        }
    }

    @Test
    void getByDateBetween_shouldThrowAccessDeniedException_whenUserIsTenantAndNotOwner() {
        contract.setUserId("user-id");

        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));

        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::isTenant).thenReturn(true);
            utilities.when(SecurityUtils::getCurrentUserId).thenReturn("user-ok");

            assertThrows(AccessDeniedException.class, () -> paymentService.getByDateBetween(
                    contract.getId(),
                    LocalDateTime.now().minusDays(5),
                    LocalDateTime.now()
            ));
        }
    }
}