package pi.ms_users.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.Contract;
import pi.ms_users.domain.Guarantor;

import java.util.List;
import java.util.Optional;

@Repository
public interface IGuarantorRepository extends JpaRepository<Guarantor, Long>, JpaSpecificationExecutor<Guarantor> {
    @Query("select distinct g from Guarantor g where g.email = ?1")
    Optional<Guarantor> findByEmail(String email);

    @Query("select distinct g from Guarantor g where g.phone = ?1")
    Optional<Guarantor> findByPhone(String phone);

    @EntityGraph(attributePaths = { "contracts" })
    @Query("select g from Guarantor g where g.id = ?1")
    Optional<Guarantor> findByIdWithContracts(Long id);

    @Query("select distinct g from Guarantor g join g.contracts c where c.id = ?1")
    List<Guarantor> findByContractId(Long contractId);

    @Query("select distinct c from Contract c join c.guarantors g where g.id = ?1")
    List<Contract> findByGuarantorId(Long guarantorId);
}