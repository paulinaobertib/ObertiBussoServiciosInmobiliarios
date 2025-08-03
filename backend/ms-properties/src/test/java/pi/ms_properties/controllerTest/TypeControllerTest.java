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
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.TypeController;
import pi.ms_properties.domain.Type;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.TypeService;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TypeController.class)
@Import({TypeControllerTest.Config.class, WebSecurityConfig.class})
class TypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TypeService typeService;

    @Autowired
    private ObjectMapper objectMapper;

    private Type sampleType;

    @TestConfiguration
    static class Config {
        @Bean
        public TypeService typeService() {
            return Mockito.mock(TypeService.class);
        }
    }

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

    @Test
    @WithMockUser(roles = "admin")
    void searchType_shouldReturnOk_withResults() throws Exception {
        Type type1 = new Type(1L, "Departamento", true, true, true, true);
        Type type2 = new Type(2L, "Casa", false, true, true, false);
        List<Type> resultList = Arrays.asList(type1, type2);

        Mockito.when(typeService.findBy("Depar")).thenReturn(ResponseEntity.ok(resultList));

        mockMvc.perform(get("/type/search")
                        .param("search", "Depar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Departamento"))
                .andExpect(jsonPath("$[1].name").value("Casa"));
    }

    // casos de error

    @Test
    void testCreateTypeWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(post("/type/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleType)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUpdateTypeWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(put("/type/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleType)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testDeleteTypeWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(delete("/type/delete/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetTypeByIdNotFound_shouldReturn404() throws Exception {
        Mockito.when(typeService.getById(99L)).thenReturn(ResponseEntity.status(404).build());

        mockMvc.perform(get("/type/getById/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "admin")
    void searchType_shouldReturnEmptyList_whenNoResults() throws Exception {
        Mockito.when(typeService.findBy("XYZ")).thenReturn(ResponseEntity.ok(Collections.emptyList()));

        mockMvc.perform(get("/type/search")
                        .param("search", "XYZ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void searchType_shouldReturnUnauthorized_whenNoUser() throws Exception {
        mockMvc.perform(get("/type/search")
                        .param("search", "Casa"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "user")
    void searchType_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/type/search")
                        .param("search", "Casa"))
                .andExpect(status().isForbidden());
    }
}
