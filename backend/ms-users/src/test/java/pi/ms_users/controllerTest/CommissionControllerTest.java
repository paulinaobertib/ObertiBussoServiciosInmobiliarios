package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import pi.ms_users.controller.CommissionController;
import pi.ms_users.domain.CommissionPaymentType;
import pi.ms_users.domain.CommissionStatus;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.CommissionDTO;
import pi.ms_users.dto.CommissionGetDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.impl.CommissionService;
import pi.ms_users.service.interf.ICommissionService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommissionController.class)
@Import({CommissionControllerTest.Config.class, WebSecurityConfig.class})
class CommissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ICommissionService commissionService;

    @TestConfiguration
    static class Config {
        @Bean
        public ICommissionService commissionService() {
            return Mockito.mock(ICommissionService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private CommissionDTO getSampleDTO() {
        CommissionDTO dto = new CommissionDTO();
        dto.setId(1L);
        dto.setContractId(100L);
        dto.setTotalAmount(BigDecimal.valueOf(500));
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setDate(LocalDate.of(2025, 1, 1));
        dto.setPaymentType(CommissionPaymentType.CUOTAS);
        dto.setInstallments(3);
        dto.setStatus(CommissionStatus.PENDIENTE);
        dto.setNote("Nota test");
        return dto;
    }

    private CommissionGetDTO getSampleGetDTO() {
        CommissionGetDTO dto = new CommissionGetDTO();
        dto.setId(1L);
        dto.setContractId(100L);
        dto.setTotalAmount(BigDecimal.valueOf(500));
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setDate(LocalDate.of(2025, 1, 1));
        dto.setPaymentType(CommissionPaymentType.CUOTAS);
        dto.setInstallments(3);
        dto.setStatus(CommissionStatus.PENDIENTE);
        dto.setNote("Nota test");
        dto.setPayments(List.of());
        return dto;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createCommission_shouldReturnOk() throws Exception {
        CommissionDTO dto = getSampleDTO();

        when(commissionService.create(any(CommissionDTO.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/commissions/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateCommission_shouldReturnOk() throws Exception {
        CommissionDTO dto = getSampleDTO();

        when(commissionService.update(any(CommissionDTO.class)))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/commissions/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateStatus_shouldReturnOk() throws Exception {
        when(commissionService.updateStatus(1L, CommissionStatus.PAGADA))
                .thenReturn(ResponseEntity.ok("Status updated"));

        mockMvc.perform(patch("/commissions/updateStatus/1")
                        .param("status", "PAGADA"))
                .andExpect(status().isOk())
                .andExpect(content().string("Status updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteCommission_shouldReturnOk() throws Exception {
        when(commissionService.delete(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/commissions/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = {"admin", "tenant"})
    void getById_shouldReturnOk() throws Exception {
        CommissionGetDTO dto = getSampleGetDTO();

        when(commissionService.getById(1L)).thenReturn(ResponseEntity.ok(dto));

        mockMvc.perform(get("/commissions/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.totalAmount").value(500))
                .andExpect(jsonPath("$.contractId").value(100));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getTotalByStatus_shouldReturnOk() throws Exception {
        when(commissionService.getTotalAmountByStatus(CommissionStatus.PENDIENTE, PaymentCurrency.ARS))
                .thenReturn(ResponseEntity.ok(BigDecimal.valueOf(1000)));

        mockMvc.perform(get("/commissions/total/byStatus")
                        .param("status", "PENDIENTE")
                        .param("currency", "ARS"))
                .andExpect(status().isOk())
                .andExpect(content().string("1000"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getYearMonthlyTotals_shouldReturnOk() throws Exception {
        Map<YearMonth, BigDecimal> totals = Map.of(YearMonth.of(2025, 1), BigDecimal.valueOf(2000));
        when(commissionService.getYearMonthlyTotals(2025, PaymentCurrency.ARS))
                .thenReturn(ResponseEntity.ok(totals));

        mockMvc.perform(get("/commissions/total/byYearMonth")
                        .param("year", "2025")
                        .param("currency", "ARS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['2025-01']").value(2000));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "tenant")
    void createCommission_shouldReturnForbidden_whenNotAdmin() throws Exception {
        CommissionDTO dto = getSampleDTO();

        mockMvc.perform(post("/commissions/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnUnauthorized_whenNoAuth() throws Exception {
        mockMvc.perform(get("/commissions/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getAll_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/commissions/getAll"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createCommission_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/commissions/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }
}