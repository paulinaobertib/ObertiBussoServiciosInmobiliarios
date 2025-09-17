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
import pi.ms_users.controller.ContractController;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.dto.ContractGetDTO;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.feign.Status;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IContractService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContractController.class)
@Import({ContractControllerTest.Config.class, WebSecurityConfig.class})
class ContractControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IContractService contractService;

    @TestConfiguration
    static class Config {
        @Bean
        public IContractService contractService() {
            return Mockito.mock(IContractService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private ContractDTO getSampleDTO() {
        ContractDTO dto = new ContractDTO();
        dto.setId(1L);
        dto.setUserId("user123");
        dto.setPropertyId(10L);
        dto.setContractType(ContractType.VIVIENDA);
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setEndDate(LocalDate.of(2025, 12, 31));
        dto.setContractStatus(ContractStatus.ACTIVO);
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setInitialAmount(BigDecimal.valueOf(1000));
        dto.setLastPaidAmount(BigDecimal.valueOf(1000));
        dto.setLastPaidDate(LocalDateTime.now());
        dto.setNote("Nota test");
        dto.setHasDeposit(true);
        dto.setDepositAmount(BigDecimal.valueOf(2000));
        return dto;
    }

    private ContractGetDTO getSampleGetDTO() {
        ContractGetDTO dto = new ContractGetDTO();
        dto.setId(1L);
        dto.setUserId("user123");
        dto.setPropertyId(10L);
        dto.setContractType(ContractType.VIVIENDA);
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setEndDate(LocalDate.of(2025, 12, 31));
        dto.setContractStatus(ContractStatus.ACTIVO);
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setInitialAmount(BigDecimal.valueOf(1000));
        dto.setLastPaidAmount(BigDecimal.valueOf(1000));
        dto.setLastPaidDate(LocalDateTime.now());
        dto.setNote("Nota test");
        dto.setHasDeposit(true);
        dto.setDepositAmount(BigDecimal.valueOf(2000));
        return dto;
    }

    private ContractSimpleDTO getSampleSimpleDTO() {
        ContractSimpleDTO dto = new ContractSimpleDTO();
        dto.setId(1L);
        dto.setUserId("user123");
        dto.setPropertyId(10L);
        dto.setContractType(ContractType.VIVIENDA);
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setEndDate(LocalDate.of(2025, 12, 31));
        dto.setContractStatus(ContractStatus.ACTIVO);
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setInitialAmount(BigDecimal.valueOf(1000));
        return dto;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createContract_shouldReturnOk() throws Exception {
        when(contractService.create(any(ContractDTO.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/contracts/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateContract_shouldReturnOk() throws Exception {
        when(contractService.update(any(ContractDTO.class)))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/contracts/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateStatus_shouldReturnOk() throws Exception {
        when(contractService.updateStatus(1L))
                .thenReturn(ResponseEntity.ok("Status updated"));

        mockMvc.perform(patch("/contracts/updateStatus/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Status updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteContract_shouldReturnOk() throws Exception {
        when(contractService.delete(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/contracts/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = {"admin", "tenant"})
    void getById_shouldReturnOk() throws Exception {
        when(contractService.getById(1L)).thenReturn(ResponseEntity.ok(getSampleGetDTO()));

        mockMvc.perform(get("/contracts/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAll_shouldReturnOk() throws Exception {
        when(contractService.getAll()).thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByUser_shouldReturnOk() throws Exception {
        when(contractService.getByUserId("user123")).thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/getByUser/user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByStatus_shouldReturnOk() throws Exception {
        when(contractService.getByStatus(ContractStatus.ACTIVO))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/getByStatus")
                        .param("status", "ACTIVO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByType_shouldReturnOk() throws Exception {
        when(contractService.getByType(ContractType.VIVIENDA))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/getByType")
                        .param("type", "VIVIENDA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByProperty_shouldReturnOk() throws Exception {
        when(contractService.getByProperty(10L))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/getByProperty/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByPropertyMS_shouldReturnOk() throws Exception {
        when(contractService.getByPropertyForMS(10L))
                .thenReturn(ResponseEntity.ok(List.of(getSampleSimpleDTO())));

        mockMvc.perform(get("/contracts/getByPropertyMS/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByDate_shouldReturnOk() throws Exception {
        when(contractService.getByDate(LocalDate.of(2025, 1, 1)))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/getByDate")
                        .param("date", "2025-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByDateRange_shouldReturnOk() throws Exception {
        when(contractService.getByDateRange(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31)))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/getByDateRange")
                        .param("from", "2025-01-01")
                        .param("to", "2025-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void expiringWithinDays_shouldReturnOk() throws Exception {
        when(contractService.getContractsExpiringWithin(30))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/expiringWithinDays")
                        .param("days", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void endingOn_shouldReturnOk() throws Exception {
        when(contractService.getContractsEndingDate(LocalDate.of(2025, 12, 31)))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/endingOn")
                        .param("date", "2025-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void endingBetween_shouldReturnOk() throws Exception {
        when(contractService.getContractsEndingBetween(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31)))
                .thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/contracts/endingBetween")
                        .param("from", "2025-01-01")
                        .param("to", "2025-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updatePropertyStatusAndContract_shouldReturnOk() throws Exception {
        when(contractService.updatePropertyStatusAndContract(10L, 1L, Status.ALQUILADA))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/contracts/propertyContractStatus/10/1")
                        .param("status", "ALQUILADA"))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "tenant")
    void createContract_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(post("/contracts/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnUnauthorized_whenNoAuth() throws Exception {
        mockMvc.perform(get("/contracts/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getAll_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/contracts/getAll"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createContract_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/contracts/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnNotFound_whenServiceThrowsException() throws Exception {
        when(contractService.getById(999L))
                .thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/contracts/getById/999"))
                .andExpect(status().isNotFound());
    }
}