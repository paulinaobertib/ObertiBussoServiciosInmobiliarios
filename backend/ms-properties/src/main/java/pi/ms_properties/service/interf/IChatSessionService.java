package pi.ms_properties.service.interf;

import pi.ms_properties.domain.ChatSession;
import pi.ms_properties.dto.ChatSessionDTO;

import java.util.List;

public interface IChatSessionService {
    Long createFromUser(String userId, Long propertyId);

    Long createWithoutUser(ChatSessionDTO dto);

    ChatSession getById(Long id);

    List<ChatSession> getAll();
}
