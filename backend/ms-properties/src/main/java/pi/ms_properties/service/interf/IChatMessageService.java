package pi.ms_properties.service.interf;

import pi.ms_properties.domain.ChatMessage;

import java.util.List;

public interface IChatMessageService {
    void create(ChatMessage chatMessage);

    List<ChatMessage> getBySession(Long sessionId);
}
