package pi.ms_users.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_users.domain.AgentChat;
import pi.ms_users.repository.IAgentChatRepository;
import pi.ms_users.service.impl.AgentChatService;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AgentChatServiceTest {

    @Mock
    private IAgentChatRepository agentChatRepository;

    @InjectMocks
    private AgentChatService agentChatService;

    // casos de exito

    @Test
    void create_shouldCallSave() {
        AgentChat agent = new AgentChat();
        agent.setUserId("user123");
        agent.setName("Juan Pérez");
        agent.setEnabled(false);

        agentChatService.create(agent);

        verify(agentChatRepository).save(agent);
    }

    @Test
    void changeEnabled_shouldEnableUser_whenInitiallyFalse() {
        AgentChat agent = new AgentChat();
        agent.setId(1L);
        agent.setEnabled(false);

        when(agentChatRepository.findById(1L)).thenReturn(Optional.of(agent));

        agentChatService.changeEnabled(1L);

        assertTrue(agent.getEnabled());
        verify(agentChatRepository).save(agent);
    }

    @Test
    void changeEnabled_shouldDisableUser_whenInitiallyTrue() {
        AgentChat agent = new AgentChat();
        agent.setId(2L);
        agent.setEnabled(true);

        when(agentChatRepository.findById(2L)).thenReturn(Optional.of(agent));

        agentChatService.changeEnabled(2L);

        assertFalse(agent.getEnabled());
        verify(agentChatRepository).save(agent);
    }

    @Test
    void delete_shouldCallRepository() {
        agentChatService.delete(1L);
        verify(agentChatRepository).deleteById(1L);
    }

    @Test
    void getById_shouldReturnAgent_whenFound() {
        AgentChat agent = new AgentChat();
        agent.setId(1L);

        when(agentChatRepository.findById(1L)).thenReturn(Optional.of(agent));

        AgentChat result = agentChatService.getById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void getByUserId_shouldReturnAgent() {
        AgentChat agent = new AgentChat();
        agent.setUserId("user123");

        when(agentChatRepository.findByUserId("user123")).thenReturn(agent);

        AgentChat result = agentChatService.getByUserId("user123");

        assertEquals("user123", result.getUserId());
    }

    @Test
    void getUsersEnabledTrue_shouldReturnList() {
        AgentChat a1 = new AgentChat();
        AgentChat a2 = new AgentChat();

        when(agentChatRepository.findEnabledTrue()).thenReturn(List.of(a1, a2));

        List<AgentChat> result = agentChatService.getUsersEnabledTrue();

        assertEquals(2, result.size());
    }

    // casos de error

    @Test
    void changeEnabled_shouldThrowException_whenAgentNotFound() {
        when(agentChatRepository.findById(99L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class,
                () -> agentChatService.changeEnabled(99L));

        assertEquals("No se ha encontrado el agente.", ex.getMessage());
    }

    @Test
    void getById_shouldThrowException_whenNotFound() {
        when(agentChatRepository.findById(123L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class,
                () -> agentChatService.getById(123L));

        assertEquals("No se ha encontrado el agente.", ex.getMessage());
    }
}
