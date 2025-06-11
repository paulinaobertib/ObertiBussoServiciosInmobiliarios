package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.ContractIncrease;

import java.util.List;
import java.util.Optional;

public interface IContractIncreaseRepository extends JpaRepository<ContractIncrease, Long> {
    @Query("select ci from ContractIncrease ci where ci.contract.id = ?1")
    List<ContractIncrease> findByContractId(Long contractId);

    // agarramos el ultimo
    @Query("select ci from ContractIncrease ci where ci.contract = ?1 order by ci.date desc limit 1")
    Optional<ContractIncrease> findTopByContractOrderByDateDesc(Contract contract);
}
