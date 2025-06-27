package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.AgentAssignment;

@Repository
public interface IAgentAssignmentRepository extends JpaRepository<AgentAssignment, Long> {
    @Query("select aa.agentId from AgentAssignment aa order by aa.id desc limit 1")
    String getLast();
}
