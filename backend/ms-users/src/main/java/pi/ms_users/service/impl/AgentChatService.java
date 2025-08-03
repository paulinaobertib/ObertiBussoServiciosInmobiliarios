package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.AgentChat;
import pi.ms_users.repository.IAgentChatRepository;
import pi.ms_users.service.interf.IAgentChatService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentChatService implements IAgentChatService {

    private final IAgentChatRepository agentChatRepository;

    @Override
    public void create(AgentChat agentChat) {
        agentChatRepository.save(agentChat);
    }

    @Override
    public void changeEnabled(Long id) {
        AgentChat agentChat = agentChatRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el agente."));

        if (agentChat.getEnabled() == Boolean.FALSE) {
            agentChat.setEnabled(Boolean.TRUE);
        } else {
            agentChat.setEnabled(Boolean.FALSE);
        }

        agentChatRepository.save(agentChat);
    }

    @Override
    public void delete(Long id) {
        agentChatRepository.deleteById(id);
    }

    @Override
    public AgentChat getById(Long id) {
        return agentChatRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el agente."));
    }

    @Override
    public AgentChat getByUserId(String userId) {
        return agentChatRepository.findByUserId(userId);
    }

    @Override
    public List<AgentChat> getUsersEnabledTrue() {
        return agentChatRepository.findEnabledTrue();
    }
}
