/*package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.PaymentController;
import pi.ms_users.domain.Payment;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IPaymentService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@Import({PaymentControllerTest.Config.class, WebSecurityConfig.class})
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IPaymentService paymentService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @TestConfiguration
    static class Config {
        @Bean
        public IPaymentService paymentService() {
            return Mockito.mock(IPaymentService.class);
        }
    }

    private Payment samplePayment() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setAmount(new BigDecimal("1000.00"));
        payment.setDate(LocalDateTime.now());
        payment.setDescription("Test payment");
        payment.setPaymentCurrency(PaymentCurrency.USD);
        return payment;
    }

    // casos de exito

    @Test
    void createPayment_shouldReturnOk() throws Exception {
        Payment payment = samplePayment();
        Mockito.when(paymentService.createPayment(any())).thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/payments/create")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payment)))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    void updatePayment_shouldReturnOk() throws Exception {
        Payment payment = samplePayment();
        Mockito.when(paymentService.updatePayment(any())).thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/payments/update")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payment)))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    void deletePayment_shouldReturnOk() throws Exception {
        Mockito.when(paymentService.deletePayment(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/payments/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void getById_shouldReturnPayment() throws Exception {
        Payment payment = samplePayment();
        Mockito.when(paymentService.getById(1L)).thenReturn(ResponseEntity.ok(payment));

        mockMvc.perform(get("/payments/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getByContractId_shouldReturnPayments() throws Exception {
        Payment payment = samplePayment();
        Mockito.when(paymentService.getByContractId(10L)).thenReturn(ResponseEntity.ok(List.of(payment)));

        mockMvc.perform(get("/payments/contract/10")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getByDate_shouldReturnPayments() throws Exception {
        Payment payment = samplePayment();
        LocalDateTime date = LocalDateTime.now();
        Mockito.when(paymentService.getByDate(10L, date)).thenReturn(ResponseEntity.ok(List.of(payment)));

        mockMvc.perform(get("/payments/getByDate")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .param("contract", "10")
                        .param("date", date.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getByDateBetween_shouldReturnPayments() throws Exception {
        Payment payment = samplePayment();
        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now();
        Mockito.when(paymentService.getByDateBetween(10L, start, end)).thenReturn(ResponseEntity.ok(List.of(payment)));

        mockMvc.perform(get("/payments/getByDateBetween")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .param("contractId", "10")
                        .param("start", start.toString())
                        .param("end", end.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    // casos de error

    @Test
    void createPayment_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(post("/payments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deletePayment_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(delete("/payments/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_notFound_shouldReturn404() throws Exception {
        Mockito.when(paymentService.getById(99L)).thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/payments/getById/99")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void getByDate_invalidDate_shouldReturn400() throws Exception {
        mockMvc.perform(get("/payments/getByDate")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user")))
                        .param("contract", "10")
                        .param("date", "INVALID_DATE"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getByDateBetween_missingParam_shouldReturn400() throws Exception {
        mockMvc.perform(get("/payments/getByDateBetween")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user")))
                        .param("contractId", "10"))
                .andExpect(status().isBadRequest());
    }
}
 */