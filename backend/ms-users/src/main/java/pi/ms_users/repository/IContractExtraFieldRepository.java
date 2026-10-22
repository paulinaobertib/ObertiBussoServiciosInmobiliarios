package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.ContractExtraField;

import java.util.List;

public interface IContractExtraFieldRepository extends JpaRepository<ContractExtraField, Long> {

    @Query("SELECT f FROM ContractExtraField f WHERE f.contractId = ?1 ORDER BY f.position ASC")
    List<ContractExtraField> findByContractId(Long contractId);

    @Modifying
    @Query("DELETE FROM ContractExtraField f WHERE f.contractId = ?1")
    void deleteByContractId(Long contractId);
}
