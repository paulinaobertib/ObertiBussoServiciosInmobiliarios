package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.Payment;
import pi.ms_users.domain.PaymentConcept;
import pi.ms_users.domain.PaymentCurrency;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IPaymentRepository extends JpaRepository<Payment, Long> {
    @Query("SELECT p FROM Payment p WHERE p.contract.id = ?1")
    List<Payment> findByContractId(Long contractId);

    @Query("SELECT p FROM Payment p WHERE p.contractUtility.id = ?1")
    List<Payment> findByContractUtilityId(Long contractUtilityId);

    @Query("SELECT p FROM Payment p WHERE p.commission.id = ?1")
    List<Payment> findByCommissionId(Long commissionId);

    @Query("SELECT p FROM Payment p WHERE p.contract.id = ?1 ORDER BY p.date DESC LIMIT 1")
    Optional<Payment> findLastByContractId(Long contractId);

    @Query("SELECT p FROM Payment p WHERE p.contractUtility.id = ?1 ORDER BY p.date DESC LIMIT 1")
    Optional<Payment> findLastByContractUtilityId(Long contractUtilityId);

    @Query("SELECT p FROM Payment p WHERE p.commission.id = ?1 ORDER BY p.date DESC LIMIT 1")
    Optional<Payment> findLastByCommissionId(Long commissionId);

    @Query("SELECT p FROM Payment p WHERE p.date BETWEEN ?1 AND ?2")
    List<Payment> findByDateRange(LocalDateTime from, LocalDateTime to);

    @Query("SELECT p FROM Payment p WHERE p.contract.id = ?1 AND p.date BETWEEN ?2 AND ?3")
    List<Payment> findByDateRangeAndContract(Long contractId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT p FROM Payment p WHERE p.contractUtility.id = ?1 AND p.date BETWEEN ?2 AND ?3")
    List<Payment> findByDateRangeAndContractUtility(Long contractUtilityId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT p FROM Payment p WHERE p.commission.id = ?1 AND p.date BETWEEN ?2 AND ?3")
    List<Payment> findByDateRangeAndCommission(Long commissionId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT p FROM Payment p WHERE p.concept = ?1")
    List<Payment> findByConcept(PaymentConcept concept);

    @Query("SELECT p FROM Payment p WHERE p.paymentCurrency = ?1")
    List<Payment> findByCurrency(PaymentCurrency currency);
}