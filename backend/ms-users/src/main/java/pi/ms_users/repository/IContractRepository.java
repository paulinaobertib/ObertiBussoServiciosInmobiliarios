package pi.ms_users.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IContractRepository extends JpaRepository<Contract, Long> {
    @Transactional
    @Modifying
    @Query("DELETE FROM Contract c WHERE c.propertyId = ?1")
    void deleteByPropertyId(Long propertyId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Contract c WHERE c.userId = ?1")
    void deleteByUserId(String userId);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    Optional<Contract> findById(Long id);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    List<Contract> findAll();

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.userId = ?1")
    List<Contract> findByUserId(String userId);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.contractStatus = ?1")
    List<Contract> findByStatus(ContractStatus status);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.contractType = ?1")
    List<Contract> findByType(ContractType type);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.contractStatus = pi.ms_users.domain.ContractStatus.ACTIVO")
    List<Contract> findActiveContracts();

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.propertyId = ?1")
    List<Contract> findByProperty(Long propertyId);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.propertyId = ?1")
    List<Contract> findByPropertyMS(Long propertyId);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.startDate = ?1 OR c.endDate = ?1")
    List<Contract> findByDate(@Param("date") LocalDate date);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.startDate >= ?1 AND c.endDate <= ?2")
    List<Contract> findByDateRange(LocalDate from, LocalDate to);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.endDate BETWEEN ?1 AND ?2")
    List<Contract> findExpiringBetween(LocalDate from, LocalDate to);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("SELECT c FROM Contract c WHERE c.endDate = ?1")
    List<Contract> findByExactEndDate(@Param("date") LocalDate date);

    @EntityGraph(attributePaths = {"adjustmentIndex", "contractUtilities", "contractIncrease", "payments"})
    @Query("select c from Contract c where c.endDate between CURRENT_DATE and ?1")
    List<Contract> findExpiringUntil(@Param("to") LocalDate to);
}