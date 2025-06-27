package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.AgentChat;

import java.util.List;

@Repository
public interface IAgentChatRepository extends JpaRepository<AgentChat, Long> {
    @Query("select ag from AgentChat ag where ag.userId = ?1")
    AgentChat findByUserId(String userId);

    @Query("select ag from AgentChat ag where ag.enabled")
    List<AgentChat> findEnabledTrue();
}
