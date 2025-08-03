package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.domain.ChatMessage;
import pi.ms_properties.domain.ChatOption;
import pi.ms_properties.domain.ChatSession;
import pi.ms_properties.repository.IChatMessageRepository;
import pi.ms_properties.service.impl.ChatMessageService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatMessageServiceTest {

    @InjectMocks
    private ChatMessageService chatMessageService;

    @Mock
    private IChatMessageRepository chatMessageRepository;

    private ChatMessage chatMessage;

    @BeforeEach
    void setUp() {
        ChatSession chatSession = new ChatSession();
        chatSession.setId(100L);

        chatMessage = new ChatMessage();
        chatMessage.setId(1L);
        chatMessage.setChatOption(ChatOption.VER_PRECIO);
        chatMessage.setChatSession(chatSession);
    }

    // casos de exito

    @Test
    void testCreate_Success() {
        chatMessageService.create(chatMessage);

        verify(chatMessageRepository).save(chatMessage);
    }

    @Test
    void testGetBySession_Success() {
        List<ChatMessage> messages = List.of(chatMessage);
        when(chatMessageRepository.findBySession(100L)).thenReturn(messages);

        List<ChatMessage> result = chatMessageService.getBySession(100L);

        assertEquals(1, result.size());
        assertEquals(chatMessage.getId(), result.getFirst().getId());
    }

    // casos de error

    @Test
    void testCreate_InternalError() {
        doThrow(new RuntimeException("DB error")).when(chatMessageRepository).save(chatMessage);

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatMessageService.create(chatMessage)
        );

        assertEquals("DB error", exception.getMessage());
    }

    @Test
    void testGetBySession_InternalError() {
        when(chatMessageRepository.findBySession(100L)).thenThrow(new RuntimeException("Query failed"));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatMessageService.getBySession(100L)
        );

        assertEquals("Query failed", exception.getMessage());
    }
}