package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.Utility;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUtilityRepository extends JpaRepository<Utility, Long> {
    @Query("select u from Utility u where u.name = ?1")
    Optional<Utility> findByName(String name);

    @Query("select c from Contract c join c.contractUtilities cu where cu.utility.id = ?1")
    List<Contract> findAllContractsByUtilityId(Long utilityId);

    @Query("select u from Utility u join u.contractUtilities cu where cu.contract.id = ?1 ")
    List<Utility> findAllByContractId(Long contractId);

    @Query("select case when count(c) > 0 then true else false end from Contract c join c.contractUtilities cu where cu.utility.id = ?1")
    boolean existsByUtilitiesId(Long utilityId);
}
