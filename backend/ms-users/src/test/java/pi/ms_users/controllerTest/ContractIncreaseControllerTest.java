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
import pi.ms_users.controller.ContractIncreaseController;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IContractIncreaseService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContractIncreaseController.class)
@Import({ContractIncreaseControllerTest.Config.class, WebSecurityConfig.class})
class ContractIncreaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IContractIncreaseService contractIncreaseService;

    @TestConfiguration
    static class Config {
        @Bean
        public IContractIncreaseService contractIncreaseService() {
            return Mockito.mock(IContractIncreaseService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private ContractIncreaseDTO getSampleDTO() {
        ContractIncreaseDTO dto = new ContractIncreaseDTO();
        dto.setId(1L);
        dto.setDate(LocalDateTime.of(2025, 1, 1, 10, 0));
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setAmount(BigDecimal.valueOf(1500));
        dto.setAdjustment(10);
        dto.setNote("Ajuste test");
        dto.setPeriodFrom(LocalDateTime.of(2025, 1, 1, 0, 0));
        dto.setPeriodTo(LocalDateTime.of(2025, 12, 31, 23, 59));
        dto.setContractId(100L);
        dto.setIndexId(200L);
        return dto;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createIncrease_shouldReturnOk() throws Exception {
        when(contractIncreaseService.create(any(ContractIncreaseDTO.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/contractIncreases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateIncrease_shouldReturnOk() throws Exception {
        when(contractIncreaseService.update(any(ContractIncreaseDTO.class)))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/contractIncreases/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteIncrease_shouldReturnOk() throws Exception {
        when(contractIncreaseService.delete(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/contractIncreases/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteByContract_shouldReturnOk() throws Exception {
        when(contractIncreaseService.deleteByContractId(100L)).thenReturn(ResponseEntity.ok("Deleted by contract"));

        mockMvc.perform(delete("/contractIncreases/deleteByContract/100"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted by contract"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnOk() throws Exception {
        when(contractIncreaseService.getById(1L)).thenReturn(ResponseEntity.ok(getSampleDTO()));

        mockMvc.perform(get("/contractIncreases/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.amount").value(1500));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByContractId_shouldReturnOk() throws Exception {
        when(contractIncreaseService.getByContractId(100L))
                .thenReturn(ResponseEntity.ok(List.of(getSampleDTO())));

        mockMvc.perform(get("/contractIncreases/getByContract/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getLastByContractId_shouldReturnOk() throws Exception {
        when(contractIncreaseService.getLastByContractId(100L))
                .thenReturn(ResponseEntity.ok(getSampleDTO()));

        mockMvc.perform(get("/contractIncreases/getLast/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contractId").value(100));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "tenant")
    void createIncrease_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(post("/contractIncreases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnUnauthorized_whenNoAuth() throws Exception {
        mockMvc.perform(get("/contractIncreases/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createIncrease_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/contractIncreases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnNotFound_whenServiceThrowsException() throws Exception {
        when(contractIncreaseService.getById(999L))
                .thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/contractIncreases/getById/999"))
                .andExpect(status().isNotFound());
    }
}