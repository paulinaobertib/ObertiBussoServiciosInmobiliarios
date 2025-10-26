package pi.ms_properties.controllerTest;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.SuggestionController;
import pi.ms_properties.domain.Suggestion;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.SuggestionService;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SuggestionController.class)
@Import({SuggestionControllerTest.Config.class, WebSecurityConfig.class})
class SuggestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SuggestionService suggestionService;

    @TestConfiguration
    static class Config {
        @Bean
        public SuggestionService suggestionService() {
            return Mockito.mock(SuggestionService.class);
        }
    }

    // casos de exito

    @Test
    void createSuggestion_shouldReturnOk_publicEndpoint() throws Exception {
        when(suggestionService.createSuggestion("Mejorar diseño del catálogo"))
                .thenReturn(ResponseEntity.ok("La sugerencia se creó correctamente."));

        mockMvc.perform(post("/suggestions/create")
                        .param("description", "Mejorar diseño del catálogo"))
                .andExpect(status().isOk())
                .andExpect(content().string("La sugerencia se creó correctamente."));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAllSuggestions_shouldReturnOk_forAdmin() throws Exception {
        Suggestion s1 = new Suggestion();
        s1.setId(1L);
        s1.setDescription("Agregar buscador avanzado");

        Suggestion s2 = new Suggestion();
        s2.setId(2L);
        s2.setDescription("Permitir comentarios de usuarios");

        List<Suggestion> suggestions = Arrays.asList(s1, s2);

        when(suggestionService.getAll()).thenReturn(ResponseEntity.ok(suggestions));

        mockMvc.perform(get("/suggestions/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].description").value("Agregar buscador avanzado"))
                .andExpect(jsonPath("$[1].description").value("Permitir comentarios de usuarios"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAllSuggestions_shouldReturnEmptyList_whenNoData() throws Exception {
        when(suggestionService.getAll()).thenReturn(ResponseEntity.ok(Collections.emptyList()));

        mockMvc.perform(get("/suggestions/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // casos de error

    @Test
    void createSuggestion_shouldReturnBadRequest_whenDescriptionMissing() throws Exception {
        mockMvc.perform(post("/suggestions/create"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllSuggestions_shouldReturnUnauthorized_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/suggestions/getAll"))
                .andExpect(status().isUnauthorized());
    }
}