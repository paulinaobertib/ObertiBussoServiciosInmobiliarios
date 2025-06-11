package pi.ms_users.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IContractRepository extends JpaRepository<Contract, Long> {
    @EntityGraph(attributePaths = {"contractIncrease"})
    Optional<Contract> findById(Long id);

    @EntityGraph(attributePaths = {"contractIncrease"})
    List<Contract> findAll();

    @EntityGraph(attributePaths = {"contractIncrease"})
    @Query("select c from Contract c where c.userId = ?1")
    List<Contract> findByUserId(String userId);

    @EntityGraph(attributePaths = {"contractIncrease"})
    @Query("select c from Contract c where c.propertyId = ?1")
    List<Contract> findByPropertyId(Long properyId);

    @EntityGraph(attributePaths = {"contractIncrease"})
    @Query("select c from Contract c where c.contractType = ?1")
    List<Contract> findByType(ContractType type);

    @EntityGraph(attributePaths = {"contractIncrease"})
    @Query("select c from Contract c where c.contractStatus = ?1")
    List<Contract> findByStatus(ContractStatus status);

    @EntityGraph(attributePaths = {"contractIncrease"})
    @Query("select c from Contract c where c.startDate between ?1 and ?2 or c.endDate between ?1 and ?2")
    List<Contract> findByDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    @EntityGraph(attributePaths = {"contractIncrease"})
    @Query("select c from Contract  c where c.contractStatus = ?1 and c.endDate > ?2")
    List<Contract> findByStatusAndEndDateAfter(ContractStatus status, LocalDateTime now);

    @Query("select c from Contract c where c.contractStatus = :status and DATE(c.endDate) = CURRENT_DATE")
    List<Contract> findContractsEndingToday(@Param("status") ContractStatus status);

    @Query("select c from Contract c where c.contractStatus = :status and c.endDate between :start and :end")
    List<Contract> findByStatusAndEndDateBetween(@Param("status") ContractStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
