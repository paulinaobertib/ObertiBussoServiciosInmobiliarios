package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.ChatSessionController;
import pi.ms_properties.domain.ChatSession;
import pi.ms_properties.dto.ChatSessionDTO;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.interf.IChatSessionService;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatSessionController.class)
@Import({ChatSessionControllerTest.Config.class, WebSecurityConfig.class}) // Asegurate de importar tu config real
class ChatSessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IChatSessionService chatSessionService;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class Config {
        @Bean
        public IChatSessionService chatSessionService() {
            return Mockito.mock(IChatSessionService.class);
        }

        @Bean
        public WebSecurityConfig webSecurityConfig() {
            return new WebSecurityConfig();
        }
    }

    @BeforeEach
    void resetMocks() {
        Mockito.reset(chatSessionService);
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "user")
    void createSessionUser_success() throws Exception {
        mockMvc.perform(post("/chatSession/createUser")
                        .param("userId", "user123")
                        .param("propertyId", "1"))
                .andExpect(status().isOk());

        Mockito.verify(chatSessionService).createFromUser("user123", 1L);
    }

    @Test
    void createSession_success() throws Exception {
        ChatSessionDTO dto = new ChatSessionDTO();
        dto.setUserId("user123");
        dto.setPhone("123456789");
        dto.setEmail("user@example.com");
        dto.setFirstName("Juan");
        dto.setLastName("Perez");
        dto.setPropertyId(1L);

        mockMvc.perform(post("/chatSession/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        Mockito.verify(chatSessionService).createWithoutUser(dto);
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_success() throws Exception {
        ChatSession session = new ChatSession();
        session.setId(1L);

        Mockito.when(chatSessionService.getById(1L)).thenReturn(session);

        mockMvc.perform(get("/chatSession/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(roles = "user")
    void getById_forbidden() throws Exception {
        mockMvc.perform(get("/chatSession/getById/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAll_success() throws Exception {
        ChatSession session = new ChatSession();
        session.setId(1L);

        Mockito.when(chatSessionService.getAll()).thenReturn(List.of(session));

        mockMvc.perform(get("/chatSession/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "user")
    void createSessionUser_missingPropertyId_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/chatSession/createUser")
                        .param("userId", "user123"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createSession_invalidJson_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/chatSession/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("")) // body vacío
                .andExpect(status().isBadRequest());
    }

    @Test
    void getById_noRole_returnsForbidden() throws Exception {
        mockMvc.perform(get("/chatSession/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "user")
    void getAll_wrongRole_returnsForbidden() throws Exception {
        mockMvc.perform(get("/chatSession/getAll"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_serviceThrowsException_returnsServerError() throws Exception {
        Mockito.when(chatSessionService.getById(1L))
                .thenThrow(new RuntimeException("Error inesperado"));

        mockMvc.perform(get("/chatSession/getById/1"))
                .andExpect(status().isInternalServerError());
    }
}