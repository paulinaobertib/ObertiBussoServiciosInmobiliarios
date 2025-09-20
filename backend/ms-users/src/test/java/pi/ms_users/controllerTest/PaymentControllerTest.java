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
import pi.ms_users.controller.PaymentController;
import pi.ms_users.domain.PaymentConcept;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.PaymentDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IPaymentService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@Import({PaymentControllerTest.Config.class, WebSecurityConfig.class})
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IPaymentService paymentService;

    @TestConfiguration
    static class Config {
        @Bean
        public IPaymentService paymentService() {
            return Mockito.mock(IPaymentService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private PaymentDTO getSamplePayment() {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(1L);
        dto.setAmount(BigDecimal.valueOf(1000));
        dto.setPaymentCurrency(PaymentCurrency.ARS);
        dto.setDate(LocalDateTime.of(2025, 1, 1, 12, 0));
        dto.setDescription("Pago test");
        dto.setConcept(PaymentConcept.ALQUILER);
        dto.setContractId(10L);
        return dto;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createPayment_shouldReturnOk() throws Exception {
        when(paymentService.create(any(PaymentDTO.class))).thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/payments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSamplePayment())))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updatePayment_shouldReturnOk() throws Exception {
        when(paymentService.update(any(PaymentDTO.class))).thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/payments/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSamplePayment())))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deletePayment_shouldReturnOk() throws Exception {
        when(paymentService.delete(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/payments/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnOk() throws Exception {
        when(paymentService.getById(1L)).thenReturn(ResponseEntity.ok(getSamplePayment()));

        mockMvc.perform(get("/payments/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.amount").value(1000));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByContract_shouldReturnOk() throws Exception {
        when(paymentService.getByContract(10L)).thenReturn(ResponseEntity.ok(List.of(getSamplePayment())));

        mockMvc.perform(get("/payments/getByContract/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByUtility_shouldReturnOk() throws Exception {
        when(paymentService.getByContractUtility(5L)).thenReturn(ResponseEntity.ok(List.of(getSamplePayment())));

        mockMvc.perform(get("/payments/getByUtility/5"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByCommission_shouldReturnOk() throws Exception {
        when(paymentService.getByCommission(3L)).thenReturn(ResponseEntity.ok(List.of(getSamplePayment())));

        mockMvc.perform(get("/payments/getByCommission/3"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getLastByContract_shouldReturnOk() throws Exception {
        when(paymentService.getLastByContract(10L)).thenReturn(ResponseEntity.ok(getSamplePayment()));

        mockMvc.perform(get("/payments/last/getByContract/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Pago test"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByRange_shouldReturnOk() throws Exception {
        when(paymentService.getByDateRange(any(), any())).thenReturn(ResponseEntity.ok(List.of(getSamplePayment())));

        mockMvc.perform(get("/payments/getByRange")
                        .param("from", "2025-01-01T00:00:00")
                        .param("to", "2025-12-31T23:59:59"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByConcept_shouldReturnOk() throws Exception {
        when(paymentService.getByConcept(PaymentConcept.ALQUILER)).thenReturn(ResponseEntity.ok(List.of(getSamplePayment())));

        mockMvc.perform(get("/payments/getByConcept/ALQUILER"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByCurrency_shouldReturnOk() throws Exception {
        when(paymentService.getByCurrency(PaymentCurrency.ARS)).thenReturn(ResponseEntity.ok(List.of(getSamplePayment())));

        mockMvc.perform(get("/payments/getByCurrency/ARS"))
                .andExpect(status().isOk());
    }

    // casos de error

    @Test
    @WithMockUser(roles = "tenant")
    void createPayment_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(post("/payments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSamplePayment())))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnUnauthorized_whenNoAuth() throws Exception {
        mockMvc.perform(get("/payments/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createPayment_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/payments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnNotFound_whenServiceThrows() throws Exception {
        when(paymentService.getById(999L)).thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/payments/getById/999"))
                .andExpect(status().isNotFound());
    }
}