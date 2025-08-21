package pi.ms_users.repository;

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

public interface IContractRepository extends JpaRepository<Contract, Long> {
    @Transactional
    @Modifying
    @Query("DELETE FROM Contract c WHERE c.propertyId = ?1")
    void deleteByPropertyId(Long propertyId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Contract c WHERE c.userId = ?1")
    void deleteByUserId(String userId);

    @Query("SELECT c FROM Contract c WHERE c.userId = ?1")
    List<Contract> findByUserId(String userId);

    @Query("SELECT c FROM Contract c WHERE c.contractStatus = ?1")
    List<Contract> findByStatus(ContractStatus status);

    @Query("SELECT c FROM Contract c WHERE c.contractType = ?1")
    List<Contract> findByType(ContractType type);

    @Query("SELECT c FROM Contract c WHERE c.contractStatus = pi.ms_users.domain.ContractStatus.ACTIVO")
    List<Contract> findActiveContracts();

    @Query("SELECT c FROM Contract c WHERE c.propertyId = ?1")
    List<Contract> findByProperty(Long propertyId);

    @Query("SELECT c FROM Contract c WHERE c.startDate = ?1 OR c.endDate = ?2 ")
    List<Contract> findByDate(@Param("date") LocalDate date);

    @Query("SELECT c FROM Contract c WHERE c.startDate <= ?1 AND c.endDate >= ?2")
    List<Contract> findByDateRange(LocalDate from, LocalDate to);

    @Query("SELECT c FROM Contract c WHERE c.endDate BETWEEN ?1 AND ?2")
    List<Contract> findExpiringBetween(LocalDate from, LocalDate to);

    @Query("SELECT c FROM Contract c WHERE c.endDate = ?1")
    List<Contract> findByExactEndDate(@Param("date") LocalDate date);

    @Query(value = "SELECT * FROM Contract c WHERE c.end_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL :days DAY)", nativeQuery = true)
    List<Contract> findExpiringWithinDaysNative(@Param("days") int days);
}