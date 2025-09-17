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
import pi.ms_users.controller.ContractUtilityController;
import pi.ms_users.domain.UtilityPeriodicityPayment;
import pi.ms_users.dto.ContractUtilityDTO;
import pi.ms_users.dto.ContractUtilityGetDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IContractUtilityService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContractUtilityController.class)
@Import({ContractUtilityControllerTest.Config.class, WebSecurityConfig.class})
class ContractUtilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IContractUtilityService contractUtilityService;

    @TestConfiguration
    static class Config {
        @Bean
        public IContractUtilityService contractUtilityService() {
            return Mockito.mock(IContractUtilityService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private ContractUtilityDTO getSampleDTO() {
        ContractUtilityDTO dto = new ContractUtilityDTO();
        dto.setId(1L);
        dto.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);
        dto.setInitialAmount(BigDecimal.valueOf(500));
        dto.setLastPaidAmount(BigDecimal.valueOf(600));
        dto.setLastPaidDate(LocalDateTime.of(2025, 1, 1, 10, 0));
        dto.setNotes("Test notes");
        dto.setContractId(100L);
        dto.setUtilityId(200L);
        return dto;
    }

    private ContractUtilityGetDTO getSampleGetDTO() {
        ContractUtilityGetDTO dto = new ContractUtilityGetDTO();
        dto.setId(1L);
        dto.setPeriodicity(UtilityPeriodicityPayment.MENSUAL);
        dto.setInitialAmount(BigDecimal.valueOf(500));
        dto.setLastPaidAmount(BigDecimal.valueOf(600));
        dto.setLastPaidDate(LocalDateTime.of(2025, 1, 1, 10, 0));
        dto.setNotes("Test notes");
        dto.setContractId(100L);
        dto.setUtilityId(200L);
        dto.setPaymentList(List.of());
        dto.setIncreases(List.of());
        return dto;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createUtility_shouldReturnOk() throws Exception {
        when(contractUtilityService.create(any(ContractUtilityDTO.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/contractUtilities/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateUtility_shouldReturnOk() throws Exception {
        when(contractUtilityService.update(any(ContractUtilityDTO.class)))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/contractUtilities/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteUtility_shouldReturnOk() throws Exception {
        when(contractUtilityService.delete(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/contractUtilities/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteByContract_shouldReturnOk() throws Exception {
        when(contractUtilityService.deleteByContract(100L)).thenReturn(ResponseEntity.ok("Deleted by contract"));

        mockMvc.perform(delete("/contractUtilities/deleteByContract/100"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted by contract"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnOk() throws Exception {
        when(contractUtilityService.getById(1L)).thenReturn(ResponseEntity.ok(getSampleGetDTO()));

        mockMvc.perform(get("/contractUtilities/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.contractId").value(100));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByContract_shouldReturnOk() throws Exception {
        when(contractUtilityService.getByContract(100L))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contractUtilities/getByContract/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByUtility_shouldReturnOk() throws Exception {
        when(contractUtilityService.getByUtility(200L))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contractUtilities/getByUtility/200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByPeriodicity_shouldReturnOk() throws Exception {
        when(contractUtilityService.getByPeriodicity(UtilityPeriodicityPayment.MENSUAL))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contractUtilities/getByPeriodicity/MENSUAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "tenant")
    void createUtility_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(post("/contractUtilities/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnUnauthorized_whenNoAuth() throws Exception {
        mockMvc.perform(get("/contractUtilities/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createUtility_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/contractUtilities/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnNotFound_whenServiceThrowsException() throws Exception {
        when(contractUtilityService.getById(999L))
                .thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/contractUtilities/getById/999"))
                .andExpect(status().isNotFound());
    }
}