package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.AgentChat;
import pi.ms_users.service.interf.IAgentChatService;

import java.util.List;

@RestController
@RequestMapping("/agentChat")
@RequiredArgsConstructor
public class AgentChatController {

    private final IAgentChatService agentChatService;

    @PreAuthorize("hasRole('admin')")
    @PatchMapping("/enabled/{id}")
    ResponseEntity<String> changeEnabled(@PathVariable Long id) {
        agentChatService.changeEnabled(id);
        return ResponseEntity.ok("Se ha cambiado el estado del usuario, ahora puede recibir consultas.");
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    ResponseEntity<AgentChat> getById(@PathVariable Long id) {
         return ResponseEntity.ok(agentChatService.getById(id));
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByUserId/{userId}")
    ResponseEntity<AgentChat> getByUserId(@PathVariable String userId) {
         return ResponseEntity.ok(agentChatService.getByUserId(userId));
    }

    @GetMapping("/getEnabledTrue")
    List<AgentChat> getUsersEnabledTrue() {
         return agentChatService.getUsersEnabledTrue();
    }
}
