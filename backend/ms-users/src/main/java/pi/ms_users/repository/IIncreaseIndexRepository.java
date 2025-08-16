package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.IncreaseIndex;

@Repository
public interface IIncreaseIndexRepository extends JpaRepository<IncreaseIndex, Long> {
}
