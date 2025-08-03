package pi.ms_properties.controllerTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.ChatController;
import pi.ms_properties.domain.ChatOption;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.interf.IChatService;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatController.class)
@Import({ChatControllerTest.Config.class, WebSecurityConfig.class})
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IChatService chatService;

    @TestConfiguration
    static class Config {
        @Bean
        public IChatService chatService() {
            return Mockito.mock(IChatService.class);
        }
    }

    @BeforeEach
    void setUp() {
        Mockito.reset(chatService);
    }

    // casos de exito

    @Test
    void response_success() throws Exception {
        ChatOption chatOption = ChatOption.VER_PRECIO;
        Long propertyId = 1L;
        Long sessionId = 2L;

        Mockito.when(chatService.responseToUserMessage(chatOption, propertyId, sessionId))
                .thenReturn("Respuesta del chat");

        mockMvc.perform(post("/chat/message")
                        .param("option", chatOption.name())
                        .param("propertyId", propertyId.toString())
                        .param("sessionId", sessionId.toString()))
                .andExpect(status().isOk())
                .andExpect(content().string("Respuesta del chat"));
    }

    // casos de error

    @Test
    void response_missingSessionId_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/chat/message")
                        .param("option", ChatOption.VER_PRECIO.name())
                        .param("propertyId", "1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void response_invalidEnumValue_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/chat/message")
                        .param("option", "INVALID_OPTION")
                        .param("propertyId", "1")
                        .param("sessionId", "2"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void response_serviceThrowsException_returnsServerError() throws Exception {
        Mockito.when(chatService.responseToUserMessage(any(), any(), any()))
                .thenThrow(new RuntimeException("Algo falló"));

        mockMvc.perform(post("/chat/message")
                        .param("option", ChatOption.VER_PRECIO.name())
                        .param("propertyId", "1")
                        .param("sessionId", "2"))
                .andExpect(status().isInternalServerError());
    }
}
