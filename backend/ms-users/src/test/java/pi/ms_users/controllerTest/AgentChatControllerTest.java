package pi.ms_users.controllerTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.AgentChatController;
import pi.ms_users.domain.AgentChat;
import pi.ms_users.security.WebSecurityConfig;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import pi.ms_users.service.interf.IAgentChatService;

@WebMvcTest(AgentChatController.class)
@Import({AgentChatControllerTest.Config.class, WebSecurityConfig.class})
class AgentChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IAgentChatService agentChatService;

    @TestConfiguration
    static class Config {
        @Bean
        public IAgentChatService agentChatService() {
            return Mockito.mock(IAgentChatService.class);
        }
    }

    // casos de exito

    @Test
    void changeEnabled_shouldReturnOk_whenAdmin() throws Exception {
        mockMvc.perform(patch("/agentChat/enabled/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Se ha cambiado el estado del usuario, ahora puede recibir consultas."));
    }

    @Test
    void getById_shouldReturnOk_whenAdmin() throws Exception {
        AgentChat agentChat = new AgentChat();
        agentChat.setId(1L);
        agentChat.setUserId("user123");
        agentChat.setName("Juan Pérez");
        agentChat.setEnabled(true);

        when(agentChatService.getById(1L)).thenReturn(agentChat);

        mockMvc.perform(get("/agentChat/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    void getByUserId_shouldReturnOk_whenAdmin() throws Exception {
        AgentChat agentChat = new AgentChat();
        agentChat.setId(2L);
        agentChat.setUserId("user456");
        agentChat.setName("Ana Torres");
        agentChat.setEnabled(true);

        when(agentChatService.getByUserId("user456")).thenReturn(agentChat);

        mockMvc.perform(get("/agentChat/getByUserId/user456")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user456"))
                .andExpect(jsonPath("$.name").value("Ana Torres"));
    }

    @Test
    void getUsersEnabledTrue_shouldReturnOk() throws Exception {
        AgentChat a1 = new AgentChat();
        a1.setId(1L);
        a1.setUserId("u1");
        a1.setName("Agent 1");
        a1.setEnabled(true);

        AgentChat a2 = new AgentChat();
        a2.setId(2L);
        a2.setUserId("u2");
        a2.setName("Agent 2");
        a2.setEnabled(true);

        when(agentChatService.getUsersEnabledTrue()).thenReturn(List.of(a1, a2));

        mockMvc.perform(get("/agentChat/getEnabledTrue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // casos de error

    @Test
    void changeEnabled_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(patch("/agentChat/enabled/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/agentChat/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getByUserId_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/agentChat/getByUserId/user456")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnNotFound_whenEntityNotFound() throws Exception {
        when(agentChatService.getById(99L)).thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/agentChat/getById/99")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isNotFound());
    }
}
