package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.domain.ChatDerivation;
import pi.ms_properties.domain.ChatSession;
import pi.ms_properties.repository.IChatDerivationRepository;
import pi.ms_properties.service.impl.ChatDerivationService;
import pi.ms_properties.service.interf.IAgentAssignService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatDerivationServiceTest {

    @InjectMocks
    private ChatDerivationService chatDerivationService;

    @Mock
    private IChatDerivationRepository chatDerivationRepository;

    @Mock
    private IAgentAssignService agentAssignService;

    private ChatDerivation sampleDerivation;

    @BeforeEach
    void setUp() {
        ChatSession chatSession = new ChatSession();
        chatSession.setId(100L);

        sampleDerivation = new ChatDerivation();
        sampleDerivation.setId(1L);
        sampleDerivation.setAgentId("agent123");
        sampleDerivation.setChatSession(chatSession);
    }

    // casos de exito

    @Test
    void testCreate_Success() {
        chatDerivationService.create(sampleDerivation);

        verify(agentAssignService).create("agent123");
        verify(chatDerivationRepository).save(sampleDerivation);
    }

    // casos de error

    @Test
    void testCreate_AgentAssignError() {
        doThrow(new RuntimeException("Error asignando agente")).when(agentAssignService).create("agent123");

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatDerivationService.create(sampleDerivation)
        );

        assertEquals("Error asignando agente", exception.getMessage());
        verify(chatDerivationRepository, never()).save(any(ChatDerivation.class));
    }

    @Test
    void testCreate_RepositoryError() {
        doNothing().when(agentAssignService).create("agent123");
        doThrow(new RuntimeException("DB error")).when(chatDerivationRepository).save(sampleDerivation);

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatDerivationService.create(sampleDerivation)
        );

        assertEquals("DB error", exception.getMessage());
    }
}
