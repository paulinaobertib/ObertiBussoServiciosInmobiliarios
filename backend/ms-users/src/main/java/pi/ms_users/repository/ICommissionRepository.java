package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.Commission;
import pi.ms_users.domain.CommissionPaymentType;
import pi.ms_users.domain.CommissionStatus;
import pi.ms_users.domain.PaymentCurrency;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ICommissionRepository extends JpaRepository<Commission, Long> {
    @Query("select c from Commission c where c.contract.id = ?1 order by c.date desc, c.id desc")
    Commission findByContract_IdOrderByDateDescIdDesc(Long contractId);

    @Query("select c from Commission c where c.date = ?1 order by c.date desc, c.id desc")
    List<Commission> findByDate(LocalDate date);

    @Query("select c from Commission c where c.date between ?1 and ?2 order by c.date desc, c.id desc")
    List<Commission> findByDateBetween(LocalDate from, LocalDate to);

    @Query("select c from Commission c where c.installments= ?1 order by c.date desc, c.id desc")
    List<Commission> findByInstallments(Integer installments);

    @Query("select c from Commission c where c.status = ?1 order by c.date desc, c.id desc")
    List<Commission> findByStatus(CommissionStatus status);

    @Query("select c from Commission c where c.paymentType = ?1 order by c.date desc, c.id desc")
    List<Commission> findByPaymentType(CommissionPaymentType paymentType);

    @Query("select coalesce(sum(c.totalAmount), 0) from Commission c where c.status = ?1 and c.currency = ?2 ")
    BigDecimal sumTotalAmountByStatusAndCurrency(CommissionStatus status, PaymentCurrency currency);

    @Query("select coalesce(sum(c.totalAmount), 0) from Commission c where c.date between ?1 and ?2 and c.currency = ?3")
    BigDecimal sumTotalAmountByDateRangeAndCurrency(LocalDate from, LocalDate to, PaymentCurrency currency);

    @Query("select function('year', c.date) as yr, function('month', c.date) as mn, coalesce(sum(c.totalAmount), 0) from Commission c where function('year', c.date) = :year and c.currency = :currency group by function('year', c.date), function('month', c.date) order by function('year', c.date) asc, function('month', c.date) asc")
    List<Object[]> sumMonthlyTotalsByYearAndCurrency(Integer year, PaymentCurrency currency);

    @Query("select c.status as status, count(c) as cnt from Commission c group by c.status ")
    List<Object[]> countGroupedByStatus();
}
