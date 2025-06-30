package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.domain.AgentAssignment;
import pi.ms_properties.repository.IAgentAssignmentRepository;
import pi.ms_properties.service.impl.AgentAssignService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AgentAssignServiceTest {

    @InjectMocks
    private AgentAssignService agentAssignService;

    @Mock
    private IAgentAssignmentRepository agentAssignmentRepository;

    @BeforeEach
    void setUp() {
        AgentAssignment agentAssignment = new AgentAssignment();
        agentAssignment.setId(1L);
        agentAssignment.setAgentId("user123");
    }

    // casos de exito

    @Test
    void testCreate_Success() {
        // No se necesita mockear el save, solo verificar que se llama
        agentAssignService.create("user123");

        ArgumentCaptor<AgentAssignment> captor = ArgumentCaptor.forClass(AgentAssignment.class);
        verify(agentAssignmentRepository).save(captor.capture());

        AgentAssignment saved = captor.getValue();
        assertEquals("user123", saved.getAgentId());
    }

    // casos de error

    @Test
    void testCreate_InternalError() {
        doThrow(new RuntimeException("DB down")).when(agentAssignmentRepository).save(any(AgentAssignment.class));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                agentAssignService.create("user123")
        );

        assertEquals("DB down", exception.getMessage());
    }
}

