package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Suggestion;

import java.util.List;

public interface ISuggestionService {
    ResponseEntity<String> createSuggestion(String description);

    ResponseEntity<List<Suggestion>> getAll();
}
