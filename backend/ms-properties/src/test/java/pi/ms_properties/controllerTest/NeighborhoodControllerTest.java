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
import pi.ms_properties.dto.NeighborhoodGetDTO;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.NeighborhoodService;

import java.util.Arrays;
import java.util.Collections;
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

    private NeighborhoodGetDTO validDTO;

    @TestConfiguration
    static class Config {
        @Bean
        public NeighborhoodService neighborhoodService() {
            return Mockito.mock(NeighborhoodService.class);
        }
    }

    @BeforeEach
    void setUp() {
        validDTO = new NeighborhoodGetDTO(
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
        List<NeighborhoodGetDTO> list = List.of(validDTO);

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

    @Test
    @WithMockUser(roles = "admin")
    void searchNeighborhood_shouldReturnOk_withResults() throws Exception {
        NeighborhoodGetDTO dto1 = new NeighborhoodGetDTO(1L, "Altos del Sur", "CERRADO", "Córdoba", -45.89, 78.98);
        NeighborhoodGetDTO dto2 = new NeighborhoodGetDTO(2L, "Bajo Lado", "ABIERTO", "Córdoba", -40.12, 75.43);
        List<NeighborhoodGetDTO> resultList = Arrays.asList(dto1, dto2);

        Mockito.when(neighborhoodService.findBy("Altos")).thenReturn(ResponseEntity.ok(resultList));

        mockMvc.perform(get("/neighborhood/search")
                        .param("search", "Altos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Altos del Sur"))
                .andExpect(jsonPath("$[1].name").value("Bajo Lado"));
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

    @Test
    @WithMockUser(roles = "admin")
    void searchNeighborhood_shouldReturnEmptyList_whenNoResults() throws Exception {
        Mockito.when(neighborhoodService.findBy("XYZ")).thenReturn(ResponseEntity.ok(Collections.emptyList()));

        mockMvc.perform(get("/neighborhood/search")
                        .param("search", "XYZ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void searchNeighborhood_shouldReturnUnauthorized_whenNoUser() throws Exception {
        mockMvc.perform(get("/neighborhood/search")
                        .param("search", "Altos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "user")
    void searchNeighborhood_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/neighborhood/search")
                        .param("search", "Altos"))
                .andExpect(status().isForbidden());
    }
}
