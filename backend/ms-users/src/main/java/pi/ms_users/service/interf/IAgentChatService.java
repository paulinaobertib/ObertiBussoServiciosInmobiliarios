package pi.ms_users.service.interf;

import pi.ms_users.domain.AgentChat;

import java.util.List;

public interface IAgentChatService {
    void create(AgentChat agentChat);

    void changeEnabled(Long id);

    void delete(Long id);

    AgentChat getById(Long id);

    AgentChat getByUserId(String userId);

    List<AgentChat> getUsersEnabledTrue();
}
