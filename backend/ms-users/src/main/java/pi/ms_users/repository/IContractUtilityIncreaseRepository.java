package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.ContractUtilityIncrease;

import java.util.List;

@Repository
public interface IContractUtilityIncreaseRepository extends JpaRepository<ContractUtilityIncrease, Long> {
    @Query("SELECT c FROM ContractUtilityIncrease c WHERE c.contractUtility.id = ?1 ORDER BY c.adjustmentDate ASC")
    List<ContractUtilityIncrease> findByContractUtilityId(Long contractUtilityId);
}