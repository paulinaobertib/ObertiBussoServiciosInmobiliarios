package pi.ms_properties.feign;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.dto.feign.AgentChatDTO;
import pi.ms_properties.repository.feign.AgentChatRepository;
import pi.ms_properties.repository.feign.FeignUserRepository;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AgentChatRepositoryTest {

    @Mock
    private FeignUserRepository feignUserRepository;

    @InjectMocks
    private AgentChatRepository agentChatRepository;

    // casos de exito

    @Test
    void getAgents_returnsList_whenUsersExist() {
        AgentChatDTO agent1 = new AgentChatDTO();
        agent1.setUserId("user1");
        agent1.setName("Agent One");
        agent1.setEnabled(true);

        AgentChatDTO agent2 = new AgentChatDTO();
        agent2.setUserId("user2");
        agent2.setName("Agent Two");
        agent2.setEnabled(false);

        List<AgentChatDTO> agents = List.of(agent1, agent2);

        when(feignUserRepository.getUsersEnabled()).thenReturn(agents);

        List<AgentChatDTO> result = agentChatRepository.getAgents();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("user1", result.getFirst().getUserId());
        assertEquals("Agent One", result.get(0).getName());
        assertTrue(result.get(0).getEnabled());

        assertEquals("user2", result.get(1).getUserId());
        assertEquals("Agent Two", result.get(1).getName());
        assertFalse(result.get(1).getEnabled());
    }

    // casos de error

    @Test
    void getAgents_returnsEmptyList_whenNoUsers() {
        when(feignUserRepository.getUsersEnabled()).thenReturn(Collections.emptyList());

        List<AgentChatDTO> result = agentChatRepository.getAgents();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}

