package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.Payment;

import java.time.LocalDateTime;
import java.util.List;

public interface IPaymentRepository extends JpaRepository<Payment, Long> {
    @Query("select p from Payment p where p.contract.id = ?1")
    List<Payment> findByContractId(Long contractId);

    @Query("select p from Payment p where p.contract.id = ?1 and p.date = ?2")
    List<Payment> findByDate(Long contractId, LocalDateTime date);

    @Query("select p from Payment p where p.contract.id = ?1 and p.date between ?2 and ?3")
    List<Payment> findByDateBetween(Long contractId, LocalDateTime startDate, LocalDateTime endDate);
}
