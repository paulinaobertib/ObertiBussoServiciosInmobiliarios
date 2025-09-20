package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import pi.ms_users.controller.ContractUtilityIncreaseController;
import pi.ms_users.dto.ContractUtilityIncreaseDTO;
import pi.ms_users.dto.ContractUtilityIncreaseGetDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IContractUtilityIncreaseService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContractUtilityIncreaseController.class)
@Import({ContractUtilityIncreaseControllerTest.Config.class, WebSecurityConfig.class})
class ContractUtilityIncreaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IContractUtilityIncreaseService increaseService;

    @TestConfiguration
    static class Config {
        @Bean
        public IContractUtilityIncreaseService increaseService() {
            return Mockito.mock(IContractUtilityIncreaseService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private ContractUtilityIncreaseDTO getSampleDTO() {
        ContractUtilityIncreaseDTO dto = new ContractUtilityIncreaseDTO();
        dto.setId(1L);
        dto.setAdjustmentDate(LocalDate.of(2025, 1, 1));
        dto.setAmount(BigDecimal.valueOf(500));
        dto.setContractUtilityId(100L);
        return dto;
    }

    private ContractUtilityIncreaseGetDTO getSampleGetDTO() {
        ContractUtilityIncreaseGetDTO dto = new ContractUtilityIncreaseGetDTO();
        dto.setId(1L);
        dto.setAdjustmentDate(LocalDate.of(2025, 1, 1));
        dto.setAmount(BigDecimal.valueOf(500));
        return dto;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createIncrease_shouldReturnOk() throws Exception {
        when(increaseService.create(any(ContractUtilityIncreaseDTO.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/contractUtilityIncreases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateIncrease_shouldReturnOk() throws Exception {
        when(increaseService.update(any(ContractUtilityIncreaseDTO.class)))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/contractUtilityIncreases/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteIncrease_shouldReturnOk() throws Exception {
        when(increaseService.delete(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/contractUtilityIncreases/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnOk() throws Exception {
        when(increaseService.getById(1L)).thenReturn(ResponseEntity.ok(getSampleDTO()));

        mockMvc.perform(get("/contractUtilityIncreases/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.amount").value(500));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByContractUtility_shouldReturnOk() throws Exception {
        when(increaseService.getByContractUtility(100L))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contractUtilityIncreases/getByContractUtility/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "tenant")
    void createIncrease_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(post("/contractUtilityIncreases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnUnauthorized_whenNoAuth() throws Exception {
        mockMvc.perform(get("/contractUtilityIncreases/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createIncrease_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/contractUtilityIncreases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnNotFound_whenServiceThrowsException() throws Exception {
        when(increaseService.getById(999L))
                .thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/contractUtilityIncreases/getById/999"))
                .andExpect(status().isNotFound());
    }
}