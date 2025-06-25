package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.ChatMessage;
import pi.ms_properties.repository.IChatMessageRepository;
import pi.ms_properties.service.interf.IChatMessageService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService implements IChatMessageService {

    private final IChatMessageRepository chatMessageRepository;

    @Override
    public void create(ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
    }

    @Override
    public List<ChatMessage> getBySession(Long sessionId) {
        return chatMessageRepository.findBySession(sessionId);
    }
}
