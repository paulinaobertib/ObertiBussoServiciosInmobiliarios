package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pi.ms_properties.domain.UserView;

import java.util.List;

public interface IUserViewRepository extends JpaRepository<UserView, Long> {
    @Query("select uv from UserView uv where uv.userId = ?1")
    List<UserView> findByUserId(String userId);
}
