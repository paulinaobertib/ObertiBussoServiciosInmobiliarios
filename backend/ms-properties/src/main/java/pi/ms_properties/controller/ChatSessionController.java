package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.ChatSession;
import pi.ms_properties.dto.ChatSessionDTO;
import pi.ms_properties.service.interf.IChatSessionService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/chatSession")
public class ChatSessionController {

    private final IChatSessionService chatSessionService;

    @PreAuthorize("hasRole('user') and !hasRole('admin')")
    @PostMapping("/createUser")
    public void createSessionUser(@RequestParam("userId") String userId, @RequestParam("propertyId") Long propertyId) {
        chatSessionService.createFromUser(userId, propertyId);
    }

    @PostMapping("/create")
    public void createSession(@RequestBody ChatSessionDTO chatSessionDTO) {
        chatSessionService.createWithoutUser(chatSessionDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<ChatSession> getById(@PathVariable Long id) {
        return ResponseEntity.ok(chatSessionService.getById(id));
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<ChatSession>> getAll() {
        return ResponseEntity.ok(chatSessionService.getAll());
    }
}
