package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.Notice;

@Repository
public interface INoticeRepository extends JpaRepository<Notice, Long>, JpaSpecificationExecutor<Notice> {
}
