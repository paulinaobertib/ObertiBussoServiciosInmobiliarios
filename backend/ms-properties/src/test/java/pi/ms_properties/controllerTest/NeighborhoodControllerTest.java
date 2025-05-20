package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.NeighborhoodController;
import pi.ms_properties.dto.NeighborhoodDTO;
import pi.ms_properties.service.impl.NeighborhoodService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(NeighborhoodController.class)
@RequiredArgsConstructor
class NeighborhoodControllerTest {

    private final MockMvc mockMvc;

    @Mock
    private NeighborhoodService neighborhoodService;

    private NeighborhoodDTO validDTO;

    @BeforeEach
    void setUp() {
        validDTO = new NeighborhoodDTO(
                1L,
                "Altos del Sur",
                "CERRADO",
                "Córdoba"
        );
    }

    // casos de exito

    @Test
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
    void deleteNeighborhood_success() throws Exception {
        Mockito.when(neighborhoodService.deleteNeighborhood(1L))
                .thenReturn(ResponseEntity.ok("Barrio eliminado correctamente"));

        mockMvc.perform(delete("/neighborhood/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Barrio eliminado correctamente"));
    }

    @Test
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
    void getById_success() throws Exception {
        Mockito.when(neighborhoodService.getById(1L))
                .thenReturn(ResponseEntity.ok(validDTO));

        mockMvc.perform(get("/neighborhood/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Altos del Sur"));
    }

    // casos de error

    @Test
    void createNeighborhood_invalidType_returnsBadRequest() throws Exception {
        NeighborhoodDTO invalidDTO = new NeighborhoodDTO(2L, "Barrio Norte", "INVALIDO", "Córdoba");

        Mockito.when(neighborhoodService.createNeighborhood(any()))
                .thenThrow(new IllegalArgumentException("Tipo de barrio inválido: INVALIDO"));

        mockMvc.perform(post("/neighborhood/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteNeighborhood_notFound_returnsNotFound() throws Exception {
        Mockito.when(neighborhoodService.deleteNeighborhood(99L))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Barrio no encontrado"));

        mockMvc.perform(delete("/neighborhood/delete/99"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Barrio no encontrado"));
    }

    @Test
    void updateNeighborhood_notFound_returnsNotFound() throws Exception {
        Mockito.when(neighborhoodService.updateNeighborhood(eq(99L), any()))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));

        mockMvc.perform(put("/neighborhood/update/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(validDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    void getById_notFound_returnsNotFound() throws Exception {
        Mockito.when(neighborhoodService.getById(99L))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));

        mockMvc.perform(get("/neighborhood/getById/99"))
                .andExpect(status().isNotFound());
    }
}
