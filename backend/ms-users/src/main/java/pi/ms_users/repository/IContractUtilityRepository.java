package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.ContractUtility;
import pi.ms_users.domain.UtilityPeriodicityPayment;

import java.util.List;
import java.util.Optional;

@Repository
public interface IContractUtilityRepository extends JpaRepository<ContractUtility, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM ContractUtility cu WHERE cu.contract.id = ?1")
    void deleteByContractId(Long contractId);

    @Query("SELECT cu FROM ContractUtility cu LEFT JOIN FETCH cu.payments WHERE cu.id = ?1 ")
    Optional<ContractUtility> findDetailedById(Long id);

    @Query("SELECT DISTINCT cu FROM ContractUtility cu LEFT JOIN FETCH cu.payments WHERE cu.contract.id = ?1 ORDER BY cu.id ASC")
    List<ContractUtility> findDetailedByContractId(Long contractId);

    @Query("SELECT DISTINCT cu FROM ContractUtility cu LEFT JOIN FETCH cu.payments WHERE cu.utility.id = ?1 ORDER BY cu.id ASC")
    List<ContractUtility> findDetailedByUtilityId(Long utilityId);

    @Query("SELECT DISTINCT cu FROM ContractUtility cu LEFT JOIN FETCH cu.payments WHERE cu.periodicity = ?1 ORDER BY cu.id ASC ")
    List<ContractUtility> findDetailedByPeriodicity(UtilityPeriodicityPayment periodicity);
}
