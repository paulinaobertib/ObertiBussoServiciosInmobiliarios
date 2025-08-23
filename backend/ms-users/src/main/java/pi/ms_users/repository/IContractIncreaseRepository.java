package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractIncrease;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IContractIncreaseRepository extends JpaRepository<ContractIncrease, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM ContractIncrease ci WHERE ci.contract.id = ?1")
    void deleteByContractId(Long contractId);

    @Query("select ci from ContractIncrease ci where ci.contract.id = ?1 ORDER BY ci.date DESC")
    List<ContractIncrease> findByContractId(Long contractId);

    @Query("SELECT ci FROM ContractIncrease ci WHERE ci.contract.id = ?1 ORDER BY ci.date DESC LIMIT 1")
    Optional<ContractIncrease> findLastByContractId(Long contractId);
}