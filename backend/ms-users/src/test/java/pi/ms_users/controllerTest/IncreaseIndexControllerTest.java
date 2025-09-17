package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.IncreaseIndexController;
import pi.ms_users.domain.IncreaseIndex;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IIncreaseIndexService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IncreaseIndexController.class)
@Import({IncreaseIndexControllerTest.Config.class, WebSecurityConfig.class})
class IncreaseIndexControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IIncreaseIndexService increaseIndexService;

    @TestConfiguration
    static class Config {
        @Bean
        public IIncreaseIndexService increaseIndexService() {
            return Mockito.mock(IIncreaseIndexService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    private IncreaseIndex getSampleIndex() {
        IncreaseIndex index = new IncreaseIndex();
        index.setId(1L);
        index.setCode("IPC");
        index.setName("Indice de Precios");
        return index;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createIncreaseIndex_shouldReturnOk() throws Exception {
        when(increaseIndexService.create(any(IncreaseIndex.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/increaseIndex/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleIndex())))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateIncreaseIndex_shouldReturnOk() throws Exception {
        when(increaseIndexService.update(any(IncreaseIndex.class)))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/increaseIndex/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleIndex())))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteIncreaseIndex_shouldReturnOk() throws Exception {
        when(increaseIndexService.delete(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/increaseIndex/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnOk() throws Exception {
        when(increaseIndexService.getById(1L)).thenReturn(ResponseEntity.ok(getSampleIndex()));

        mockMvc.perform(get("/increaseIndex/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.code").value("IPC"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAll_shouldReturnOk() throws Exception {
        when(increaseIndexService.getAll()).thenReturn(ResponseEntity.ok(List.of(getSampleIndex())));

        mockMvc.perform(get("/increaseIndex/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByName_shouldReturnOk() throws Exception {
        when(increaseIndexService.getByName("Indice de Precios")).thenReturn(ResponseEntity.ok(getSampleIndex()));

        mockMvc.perform(get("/increaseIndex/getByName")
                        .param("name", "Indice de Precios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Indice de Precios"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByCode_shouldReturnOk() throws Exception {
        when(increaseIndexService.getByCode("IPC")).thenReturn(ResponseEntity.ok(getSampleIndex()));

        mockMvc.perform(get("/increaseIndex/getByCode")
                        .param("code", "IPC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("IPC"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getContractsByIncreaseIndex_shouldReturnOk() throws Exception {
        ContractSimpleDTO dto = new ContractSimpleDTO();
        dto.setId(10L);

        when(increaseIndexService.getContractsByIncreaseIndex(1L))
                .thenReturn(ResponseEntity.ok(List.of(dto)));

        mockMvc.perform(get("/increaseIndex/contracts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByContract_shouldReturnOk() throws Exception {
        when(increaseIndexService.getByContract(100L)).thenReturn(ResponseEntity.ok(getSampleIndex()));

        mockMvc.perform(get("/increaseIndex/getByContract/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("IPC"));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "tenant")
    void createIncreaseIndex_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(post("/increaseIndex/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleIndex())))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnUnauthorized_whenNoAuth() throws Exception {
        mockMvc.perform(get("/increaseIndex/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createIncreaseIndex_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/increaseIndex/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnNotFound_whenServiceThrows() throws Exception {
        when(increaseIndexService.getById(999L))
                .thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/increaseIndex/getById/999"))
                .andExpect(status().isNotFound());
    }
}