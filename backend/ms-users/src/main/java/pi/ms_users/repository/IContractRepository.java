package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;

import java.time.LocalDateTime;
import java.util.List;

public interface IContractRepository extends JpaRepository<Contract, Long> {
    @Query("select c from Contract c where c.userId = ?1")
    List<Contract> findByUserId(String userId);

    @Query("select c from Contract c where c.propertyId = ?1")
    List<Contract> findByPropertyId(Long properyId);

    @Query("select c from Contract c where c.contractType = ?1")
    List<Contract> findByType(ContractType type);

    @Query("select c from Contract c where c.contractStatus = ?1")
    List<Contract> findByStatus(ContractStatus status);

    @Query("select c from Contract c where c.id = ?1 and c.startDate between ?2 and ?3 or c.endDate between ?2 and ?3")
    List<Contract> findByDateBetween(Long contractId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("select c from Contract  c where c.contractStatus = ?1 and c.endDate > ?2")
    List<Contract> findByStatusAndEndDateAfter(ContractStatus status, LocalDateTime now);
}
