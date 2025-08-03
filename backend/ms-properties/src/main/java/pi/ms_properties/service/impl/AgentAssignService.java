package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.AgentAssignment;
import pi.ms_properties.repository.IAgentAssignmentRepository;
import pi.ms_properties.service.interf.IAgentAssignService;

@Service
@RequiredArgsConstructor
public class AgentAssignService implements IAgentAssignService {

    private final IAgentAssignmentRepository agentAssigmentRepository;

    @Override
    public void create(String userId) {
        AgentAssignment agentAssignment = new AgentAssignment();
        agentAssignment.setAgentId(userId);
        agentAssigmentRepository.save(agentAssignment);
    }
}
