package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Suggestion;
import pi.ms_properties.repository.ISuggestionRepository;
import pi.ms_properties.service.interf.ISuggestionService;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SuggestionService implements ISuggestionService {

    private final ISuggestionRepository suggestionRepository;

    @Override
    public ResponseEntity<String> createSuggestion(String description) {
        Suggestion suggestion = new Suggestion();
        suggestion.setDescription(description);
        suggestion.setDate(LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")));

        suggestionRepository.save(suggestion);

        return ResponseEntity.ok("La sugerencia se creó correctamente.");
    }

    @Override
    public ResponseEntity<List<Suggestion>> getAll() {
        return ResponseEntity.ok(suggestionRepository.findAll());
    }
}
