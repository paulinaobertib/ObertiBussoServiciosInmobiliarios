package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Suggestion;
import pi.ms_properties.service.interf.ISuggestionService;

import java.util.List;

@RestController
@RequestMapping("/suggestions")
@RequiredArgsConstructor
public class SuggestionController {

    private final ISuggestionService suggestionService;

    @PostMapping("/create")
    public ResponseEntity<String> createSuggestion(@RequestParam("description") String description) {
        return suggestionService.createSuggestion(description);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<Suggestion>> getAllSuggestions() {
        return suggestionService.getAll();
    }
}