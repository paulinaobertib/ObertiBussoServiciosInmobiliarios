package pi.ms_properties.service.interf;

import pi.ms_properties.domain.ChatOption;

public interface IChatService {
    String responseToUserMessage(ChatOption chatOption, Long propertyId, Long sessionId);
}
