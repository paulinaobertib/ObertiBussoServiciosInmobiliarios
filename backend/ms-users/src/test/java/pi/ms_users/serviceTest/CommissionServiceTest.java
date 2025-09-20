package pi.ms_users.serviceTest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import pi.ms_users.domain.*;
import pi.ms_users.dto.CommissionDTO;
import pi.ms_users.dto.CommissionGetDTO;
import pi.ms_users.repository.ICommissionRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.service.impl.CommissionService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommissionServiceTest {

    @InjectMocks
    private CommissionService commissionService;

    @Mock
    private ICommissionRepository commissionRepository;

    @Mock
    private IContractRepository contractRepository;

    @Mock
    private EntityManager em;

    private CommissionDTO dto;
    private Commission entity;

    @BeforeEach
    void setUp() {
        dto = new CommissionDTO();
        dto.setId(1L);
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setTotalAmount(BigDecimal.valueOf(1000));
        dto.setDate(LocalDate.of(2025, 1, 1));
        dto.setPaymentType(CommissionPaymentType.CUOTAS);
        dto.setInstallments(1);
        dto.setStatus(CommissionStatus.PENDIENTE);
        dto.setNote("nota");
        dto.setContractId(10L);

        Contract contract = new Contract();
        contract.setId(10L);

        entity = new Commission();
        entity.setId(1L);
        entity.setCurrency(PaymentCurrency.ARS);
        entity.setTotalAmount(BigDecimal.valueOf(1000));
        entity.setDate(LocalDate.of(2025, 1, 1));
        entity.setPaymentType(CommissionPaymentType.CUOTAS);
        entity.setInstallments(1);
        entity.setStatus(CommissionStatus.PENDIENTE);
        entity.setNote("nota");
        entity.setContract(contract);
    }

    @BeforeEach
    void init() {
        ReflectionTestUtils.setField(commissionService, "em", em);
    }

    // casos de exito

    @Test
    void create_success() {
        when(contractRepository.existsById(dto.getContractId())).thenReturn(true);
        when(em.getReference(Contract.class, dto.getContractId())).thenReturn(entity.getContract());

        ResponseEntity<String> response = commissionService.create(dto);

        assertEquals("Se ha creado la comision.", response.getBody());
        verify(commissionRepository).save(any(Commission.class));
    }

    @Test
    void update_success() {
        when(contractRepository.existsById(dto.getContractId())).thenReturn(true);
        when(commissionRepository.existsById(dto.getId())).thenReturn(true);
        when(em.getReference(Contract.class, dto.getContractId())).thenReturn(entity.getContract());

        ResponseEntity<String> response = commissionService.update(dto);

        assertEquals("Se ha actualizado la comision.", response.getBody());
        verify(commissionRepository).save(any(Commission.class));
    }

    @Test
    void updateStatus_success() {
        when(commissionRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<String> response = commissionService.updateStatus(1L, CommissionStatus.PAGADA);

        assertEquals("Se ha actualizado el estado de la comision.", response.getBody());
        assertEquals(CommissionStatus.PAGADA, entity.getStatus());
    }

    @Test
    void delete_success() {
        when(commissionRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<String> response = commissionService.delete(1L);

        assertEquals("Se ha eliminado la comision.", response.getBody());
        verify(commissionRepository).delete(entity);
    }

    @Test
    void getById_success() {
        when(commissionRepository.findById(1L)).thenReturn(Optional.of(entity));

        ResponseEntity<CommissionGetDTO> response = commissionService.getById(1L);

        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getAll_success() {
        when(commissionRepository.findAll()).thenReturn(List.of(entity));

        ResponseEntity<List<CommissionGetDTO>> response = commissionService.getAll();

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByContractId_success() {
        when(contractRepository.existsById(10L)).thenReturn(true);
        when(commissionRepository.findByContract_IdOrderByDateDescIdDesc(10L)).thenReturn(entity);

        ResponseEntity<CommissionGetDTO> response = commissionService.getByContractId(10L);

        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getByDate_success() {
        when(commissionRepository.findByDate(any())).thenReturn(List.of(entity));

        ResponseEntity<List<CommissionGetDTO>> response = commissionService.getByDate(LocalDate.of(2025, 1, 1));

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByDateRange_success() {
        when(commissionRepository.findByDateBetween(any(), any())).thenReturn(List.of(entity));

        ResponseEntity<List<CommissionGetDTO>> response = commissionService.getByDateRange(LocalDate.now(), LocalDate.now());

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByInstallments_success() {
        when(commissionRepository.findByInstallments(1)).thenReturn(List.of(entity));

        ResponseEntity<List<CommissionGetDTO>> response = commissionService.getByInstallments(1);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByStatus_success() {
        when(commissionRepository.findByStatus(CommissionStatus.PENDIENTE)).thenReturn(List.of(entity));

        ResponseEntity<List<CommissionGetDTO>> response = commissionService.getByStatus(CommissionStatus.PENDIENTE);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByPaymentType_success() {
        when(commissionRepository.findByPaymentType(CommissionPaymentType.CUOTAS)).thenReturn(List.of(entity));

        ResponseEntity<List<CommissionGetDTO>> response = commissionService.getByPaymentType(CommissionPaymentType.CUOTAS);

        assertEquals(1, response.getBody().size());
    }

    @Test
    void getTotalAmountByStatus_success() {
        when(commissionRepository.sumTotalAmountByStatusAndCurrency(CommissionStatus.PENDIENTE, PaymentCurrency.ARS))
                .thenReturn(BigDecimal.TEN);

        ResponseEntity<BigDecimal> response = commissionService.getTotalAmountByStatus(CommissionStatus.PENDIENTE, PaymentCurrency.ARS);

        assertEquals(BigDecimal.TEN, response.getBody());
    }

    @Test
    void getDateTotals_success() {
        when(commissionRepository.sumTotalAmountByDateRangeAndCurrency(any(), any(), any()))
                .thenReturn(BigDecimal.ONE);

        ResponseEntity<BigDecimal> response = commissionService.getDateTotals(LocalDate.now(), LocalDate.now(), PaymentCurrency.ARS);

        assertEquals(BigDecimal.ONE, response.getBody());
    }

    @Test
    void getYearMonthlyTotals_success() {
        when(commissionRepository.sumMonthlyTotalsByYearAndCurrency(2025, PaymentCurrency.ARS))
                .thenReturn(List.<Object[]>of(new Object[]{2025, 1, BigDecimal.TEN}));

        ResponseEntity<Map<YearMonth, BigDecimal>> response = commissionService.getYearMonthlyTotals(2025, PaymentCurrency.ARS);

        assertEquals(BigDecimal.TEN, response.getBody().get(YearMonth.of(2025, 1)));
    }

    @Test
    void countByStatus_success() {
        when(commissionRepository.countGroupedByStatus())
                .thenReturn(List.<Object[]>of(new Object[]{CommissionStatus.PENDIENTE, 5L}));

        ResponseEntity<Map<CommissionStatus, Long>> response = commissionService.countByStatus();

        assertEquals(5L, response.getBody().get(CommissionStatus.PENDIENTE));
    }

    // casos de error

    @Test
    void create_contractNotFound_throws() {
        when(contractRepository.existsById(dto.getContractId())).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> commissionService.create(dto));
    }

    @Test
    void update_contractNotFound_throws() {
        when(contractRepository.existsById(dto.getContractId())).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> commissionService.update(dto));
    }

    @Test
    void update_commissionNotFound_throws() {
        when(contractRepository.existsById(dto.getContractId())).thenReturn(true);
        when(commissionRepository.existsById(dto.getId())).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> commissionService.update(dto));
    }

    @Test
    void updateStatus_notFound_returnsBadRequest() {
        when(commissionRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = commissionService.updateStatus(1L, CommissionStatus.PAGADA);

        assertEquals("No se ha encontrado la comision.", response.getBody());
    }

    @Test
    void delete_notFound_returnsBadRequest() {
        when(commissionRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = commissionService.delete(1L);

        assertEquals("No se ha encontrado la comision.", response.getBody());
    }

    @Test
    void getById_notFound_throws() {
        when(commissionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> commissionService.getById(1L));
    }

    @Test
    void getByContractId_contractNotFound_throws() {
        when(contractRepository.existsById(10L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> commissionService.getByContractId(10L));
    }

    @Test
    void getTotalAmountByStatus_invalidStatus_throws() {
        assertThrows(IllegalArgumentException.class, () -> commissionService.getTotalAmountByStatus(null, PaymentCurrency.ARS));
    }

    @Test
    void getTotalAmountByStatus_nullCurrency_throws() {
        assertThrows(IllegalArgumentException.class, () -> commissionService.getTotalAmountByStatus(CommissionStatus.PENDIENTE, null));
    }

    @Test
    void getDateTotals_invalidCurrency_throws() {
        assertThrows(IllegalArgumentException.class, () -> commissionService.getDateTotals(LocalDate.now(), LocalDate.now(), null));
    }

    @Test
    void getDateTotals_invalidDates_throws() {
        assertThrows(IllegalArgumentException.class, () -> commissionService.getDateTotals(null, LocalDate.now(), PaymentCurrency.ARS));
        assertThrows(IllegalArgumentException.class, () -> commissionService.getDateTotals(LocalDate.now(), null, PaymentCurrency.ARS));
        assertThrows(IllegalArgumentException.class, () -> commissionService.getDateTotals(LocalDate.of(2025, 1, 2), LocalDate.of(2025, 1, 1), PaymentCurrency.ARS));
    }

    @Test
    void getYearMonthlyTotals_invalidCurrency_throws() {
        assertThrows(IllegalArgumentException.class, () -> commissionService.getYearMonthlyTotals(2025, null));
    }

    @Test
    void getYearMonthlyTotals_invalidYear_throws() {
        assertThrows(IllegalArgumentException.class, () -> commissionService.getYearMonthlyTotals(1500, PaymentCurrency.ARS));
        assertThrows(IllegalArgumentException.class, () -> commissionService.getYearMonthlyTotals(4000, PaymentCurrency.ARS));
    }
}
