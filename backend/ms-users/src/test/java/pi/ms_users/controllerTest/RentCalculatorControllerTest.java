package pi.ms_users.controllerTest;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.RentCalculatorController;
import pi.ms_users.dto.rentcalc.RentCalculationDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IRentCalculatorService;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RentCalculatorController.class)
@Import({RentCalculatorControllerTest.Config.class, WebSecurityConfig.class})
class RentCalculatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IRentCalculatorService service;

    @TestConfiguration
    static class Config {
        @Bean
        public IRentCalculatorService rentCalculatorService() {
            return Mockito.mock(IRentCalculatorService.class);
        }
    }

    @Test
    void isPublicWithoutLogin() throws Exception {
        RentCalculationDTO dto = new RentCalculationDTO();
        dto.setIndex("IPC");
        dto.setCurrentAmount(new BigDecimal("123456.00"));
        when(service.calculate(eq(new BigDecimal("100000")), eq(LocalDate.of(2025, 4, 1)), eq(3), eq("IPC"), isNull())).thenReturn(dto);

        mockMvc.perform(get("/rentCalculator/calculate")
                        .param("amount", "100000").param("startDate", "2025-04-01").param("months", "3").param("index", "IPC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentAmount").value(123456.00));
    }

    @Test
    void missingParamsIsBadRequest() throws Exception {
        mockMvc.perform(get("/rentCalculator/calculate").param("amount", "100000"))
                .andExpect(status().isBadRequest());
    }
}
