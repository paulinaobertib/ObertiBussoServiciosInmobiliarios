package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.IncreaseIndex;

import java.util.List;
import java.util.Optional;

@Repository
public interface IIncreaseIndexRepository extends JpaRepository<IncreaseIndex, Long> {
    @Query("select i from IncreaseIndex i where i.name = ?1")
    Optional<IncreaseIndex> findByName(String name);

    @Query("select i from IncreaseIndex i where i.code = ?1")
    Optional<IncreaseIndex> findByCode(String code);

    @Query("select c from Contract c where c.adjustmentIndex.id = ?1")
    List<Contract> findContractsByIncreaseIndexId(Long indexId);

    @Query("select i from IncreaseIndex i join Contract c on c.adjustmentIndex.id = i.id where c.id = ?1")
    IncreaseIndex findByContractId(Long contractId);

    @Query("select case when count(c) > 0 then true else false end from Contract c where c.adjustmentIndex.id = ?1")
    boolean existsByAdjustmentIndexId(Long adjustmentIndexId);
}
