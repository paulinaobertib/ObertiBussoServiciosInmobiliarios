package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Commission;
import pi.ms_users.domain.CommissionPaymentType;
import pi.ms_users.domain.CommissionStatus;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.CommissionDTO;
import pi.ms_users.dto.CommissionGetDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

public interface ICommissionService {
    ResponseEntity<String> create(CommissionDTO commissionDTO);

    ResponseEntity<String> update(CommissionDTO commissionDTO);

    ResponseEntity<String> updateStatus(Long id, CommissionStatus status);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<CommissionGetDTO> getById(Long id);

    ResponseEntity<List<CommissionGetDTO>> getAll();

    ResponseEntity<CommissionGetDTO> getByContractId(Long contractId);

    ResponseEntity<List<CommissionGetDTO>> getByDate(LocalDate date);

    ResponseEntity<List<CommissionGetDTO>> getByDateRange(LocalDate from, LocalDate to);

    ResponseEntity<List<CommissionGetDTO>> getByInstallments(Integer installments);

    ResponseEntity<List<CommissionGetDTO>> getByStatus(CommissionStatus status);

    ResponseEntity<List<CommissionGetDTO>> getByPaymentType(CommissionPaymentType paymentType);

    ResponseEntity<BigDecimal> getTotalAmountByStatus(CommissionStatus status, PaymentCurrency currency);

    ResponseEntity<BigDecimal> getDateTotals(LocalDate from, LocalDate to, PaymentCurrency currency);

    ResponseEntity<Map<YearMonth, BigDecimal>> getYearMonthlyTotals(int year, PaymentCurrency currency);

    ResponseEntity<Map<CommissionStatus, Long>> countByStatus();

    ResponseEntity<BigDecimal> getPartialCommissionsRemainingAmount();
}
