package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.ChatOption;
import pi.ms_properties.service.interf.IChatService;

@RequiredArgsConstructor
@RestController
@RequestMapping("/chat")
public class ChatController {

    private final IChatService chatService;

    @PostMapping("/message")
    public String response(@RequestParam("option") ChatOption chatOption, @RequestParam("propertyId") Long propertyId, @RequestParam("sessionId") Long sessionId) {
        return chatService.responseToUserMessage(chatOption, propertyId, sessionId);
    }
}
