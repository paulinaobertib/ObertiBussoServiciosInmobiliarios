package pi.ms_properties.service.interf;

import pi.ms_properties.dto.ChatSessionDTO;
import pi.ms_properties.dto.ChatSessionGetDTO;

import java.util.List;

public interface IChatSessionService {
    Long createFromUser(String userId, Long propertyId);

    Long createWithoutUser(ChatSessionDTO dto);

    ChatSessionGetDTO getById(Long id);

    List<ChatSessionGetDTO> getAll();
}
