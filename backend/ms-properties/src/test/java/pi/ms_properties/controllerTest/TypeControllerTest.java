package pi.ms_properties.controllerTest;

import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.TypeController;
import pi.ms_properties.domain.Type;
import pi.ms_properties.service.impl.TypeService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(TypeController.class)
@RequiredArgsConstructor
public class TypeControllerTest {

    private final MockMvc mockMvc;

    @Mock
    private TypeService typeService;

    private final ObjectMapper objectMapper;

    private Type sampleType;

    @BeforeEach
    void setUp() {
        sampleType = new Type(1L, "Departamento", true, true, true, true);
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void testCreateTypeSuccess() throws Exception {
        Mockito.when(typeService.createType(any())).thenReturn(ResponseEntity.status(201).body("Created"));

        mockMvc.perform(post("/type/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleType)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testUpdateTypeSuccess() throws Exception {
        Mockito.when(typeService.updateType(any())).thenReturn(ResponseEntity.ok(sampleType));

        mockMvc.perform(put("/type/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleType)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Departamento"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testDeleteTypeSuccess() throws Exception {
        Mockito.when(typeService.deleteType(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/type/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void testGetAllTypesSuccess() throws Exception {
        Mockito.when(typeService.getAll()).thenReturn(ResponseEntity.ok(List.of(sampleType)));

        mockMvc.perform(get("/type/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Departamento"));
    }

    @Test
    void testGetTypeByIdSuccess() throws Exception {
        Mockito.when(typeService.getById(1L)).thenReturn(ResponseEntity.ok(sampleType));

        mockMvc.perform(get("/type/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Departamento"));
    }

    // casos de error

    @Test
    void testCreateTypeWithoutAuth_shouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/type/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleType)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateTypeWithoutAuth_shouldReturnForbidden() throws Exception {
        mockMvc.perform(put("/type/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleType)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testDeleteTypeWithoutAuth_shouldReturnForbidden() throws Exception {
        mockMvc.perform(delete("/type/delete/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetTypeByIdNotFound_shouldReturn404() throws Exception {
        Mockito.when(typeService.getById(99L)).thenReturn(ResponseEntity.status(404).build());

        mockMvc.perform(get("/type/getById/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateTypeInvalidInput_shouldReturn400() throws Exception {
        Type invalidType = new Type(0, "", null, null, null, null);

        mockMvc.perform(post("/type/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidType)))
                .andExpect(status().isBadRequest());
    }
}
