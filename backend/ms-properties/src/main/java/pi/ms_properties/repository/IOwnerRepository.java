package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Owner;

@Repository
public interface IOwnerRepository extends JpaRepository<Owner, Long>, JpaSpecificationExecutor<Owner> {

}
