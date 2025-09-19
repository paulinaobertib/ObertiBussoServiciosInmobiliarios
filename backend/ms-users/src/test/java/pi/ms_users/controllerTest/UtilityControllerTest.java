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
import pi.ms_users.controller.UtilityController;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.UtilityDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IUtilityService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UtilityController.class)
@Import({UtilityControllerTest.Config.class, WebSecurityConfig.class})
class UtilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IUtilityService utilityService;

    @TestConfiguration
    static class Config {
        @Bean
        public IUtilityService utilityService() {
            return Mockito.mock(IUtilityService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UtilityDTO getSampleUtility() {
        UtilityDTO dto = new UtilityDTO();
        dto.setId(1L);
        dto.setName("Luz");
        return dto;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createUtility_shouldReturnOk() throws Exception {
        when(utilityService.create(any(UtilityDTO.class))).thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/utilities/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleUtility())))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateUtility_shouldReturnOk() throws Exception {
        when(utilityService.update(any(UtilityDTO.class))).thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/utilities/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleUtility())))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteUtility_shouldReturnOk() throws Exception {
        when(utilityService.delete(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/utilities/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnOk() throws Exception {
        when(utilityService.getById(1L)).thenReturn(ResponseEntity.ok(getSampleUtility()));

        mockMvc.perform(get("/utilities/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Luz"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAll_shouldReturnOk() throws Exception {
        when(utilityService.getAll()).thenReturn(ResponseEntity.ok(List.of(getSampleUtility())));

        mockMvc.perform(get("/utilities/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByName_shouldReturnOk() throws Exception {
        when(utilityService.getByName("Luz")).thenReturn(ResponseEntity.ok(getSampleUtility()));

        mockMvc.perform(get("/utilities/getByName").param("name", "Luz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Luz"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getContractsByUtility_shouldReturnOk() throws Exception {
        ContractSimpleDTO dto = new ContractSimpleDTO();
        dto.setId(100L);
        when(utilityService.getContractsByUtility(1L)).thenReturn(ResponseEntity.ok(List.of(dto)));

        mockMvc.perform(get("/utilities/contracts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByContract_shouldReturnOk() throws Exception {
        when(utilityService.getByContract(10L)).thenReturn(ResponseEntity.ok(List.of(getSampleUtility())));

        mockMvc.perform(get("/utilities/getByContract/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "tenant")
    void createUtility_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(post("/utilities/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleUtility())))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnUnauthorized_whenNoAuth() throws Exception {
        mockMvc.perform(get("/utilities/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createUtility_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/utilities/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnNotFound_whenServiceThrows() throws Exception {
        when(utilityService.getById(999L)).thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/utilities/getById/999"))
                .andExpect(status().isNotFound());
    }
}