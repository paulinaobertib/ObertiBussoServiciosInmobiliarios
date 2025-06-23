package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.NeighborhoodController;
import pi.ms_properties.dto.NeighborhoodDTO;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.NeighborhoodService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NeighborhoodController.class)
@Import({NeighborhoodControllerTest.Config.class, WebSecurityConfig.class})
class NeighborhoodControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NeighborhoodService neighborhoodService;

    private NeighborhoodDTO validDTO;

    @TestConfiguration
    static class Config {
        @Bean
        public NeighborhoodService neighborhoodService() {
            return Mockito.mock(NeighborhoodService.class);
        }
    }

    @BeforeEach
    void setUp() {
        validDTO = new NeighborhoodDTO(
                1L,
                "Altos del Sur",
                "CERRADO",
                "Córdoba",
                -45.89,
                78.98
        );
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createNeighborhood_success() throws Exception {
        Mockito.when(neighborhoodService.createNeighborhood(any()))
                .thenReturn(ResponseEntity.ok("Barrio creado correctamente"));

        mockMvc.perform(post("/neighborhood/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(validDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Barrio creado correctamente"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteNeighborhood_success() throws Exception {
        Mockito.when(neighborhoodService.deleteNeighborhood(1L))
                .thenReturn(ResponseEntity.ok("Barrio eliminado correctamente"));

        mockMvc.perform(delete("/neighborhood/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Barrio eliminado correctamente"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateNeighborhood_success() throws Exception {
        Mockito.when(neighborhoodService.updateNeighborhood(eq(1L), any()))
                .thenReturn(ResponseEntity.ok(validDTO));

        mockMvc.perform(put("/neighborhood/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(validDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Altos del Sur"));
    }

    @Test
    void getAll_success() throws Exception {
        List<NeighborhoodDTO> list = List.of(validDTO);

        Mockito.when(neighborhoodService.getAll())
                .thenReturn(ResponseEntity.ok(list));

        mockMvc.perform(get("/neighborhood/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_success() throws Exception {
        Mockito.when(neighborhoodService.getById(1L))
                .thenReturn(ResponseEntity.ok(validDTO));

        mockMvc.perform(get("/neighborhood/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Altos del Sur"));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "admin")
    void deleteNeighborhood_notFound_returnsNotFound() throws Exception {
        Mockito.when(neighborhoodService.deleteNeighborhood(99L))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Barrio no encontrado"));

        mockMvc.perform(delete("/neighborhood/delete/99"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Barrio no encontrado"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateNeighborhood_notFound_returnsNotFound() throws Exception {
        Mockito.when(neighborhoodService.updateNeighborhood(eq(99L), any()))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        mockMvc.perform(put("/neighborhood/update/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(validDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_notFound_returnsNotFound() throws Exception {
        Mockito.when(neighborhoodService.getById(99L))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        mockMvc.perform(get("/neighborhood/getById/99"))
                .andExpect(status().isNotFound());
    }
}
