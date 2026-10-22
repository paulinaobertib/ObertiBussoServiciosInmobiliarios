package pi.ms_users.controllerTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.*;
import pi.ms_users.dto.ContractGetDTO;
import pi.ms_users.security.ContractAccess;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.*;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// un inquilino no puede ver contratos ni pagos de otros, ni los listados generales
@WebMvcTest({ContractController.class, PaymentController.class, GuarantorController.class, CommissionController.class,
        ContractUtilityController.class, ContractIncreaseController.class})
@Import({ContractAccessControllerTest.Config.class, WebSecurityConfig.class})
class ContractAccessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ContractAccess contractAccess;

    @Autowired
    private IContractService contractService;

    @TestConfiguration
    static class Config {
        @Bean(name = "contractAccess")
        public ContractAccess contractAccess() {
            return Mockito.mock(ContractAccess.class);
        }

        @Bean
        public IContractService contractService() {
            return Mockito.mock(IContractService.class);
        }

        @Bean
        public IPaymentService paymentService() {
            return Mockito.mock(IPaymentService.class);
        }

        @Bean
        public IGuarantorService guarantorService() {
            return Mockito.mock(IGuarantorService.class);
        }

        @Bean
        public ICommissionService commissionService() {
            return Mockito.mock(ICommissionService.class);
        }

        @Bean
        public IContractUtilityService contractUtilityService() {
            return Mockito.mock(IContractUtilityService.class);
        }

        @Bean
        public IContractIncreaseService contractIncreaseService() {
            return Mockito.mock(IContractIncreaseService.class);
        }
    }

    @BeforeEach
    void resetGuard() {
        reset(contractAccess);
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCannotSeeSomeoneElsesContract() throws Exception {
        when(contractAccess.canViewContract(5L)).thenReturn(false);
        mockMvc.perform(get("/contracts/getById/5")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCanSeeOwnContract() throws Exception {
        when(contractAccess.canViewContract(5L)).thenReturn(true);
        when(contractService.getById(5L)).thenReturn(ResponseEntity.ok(new ContractGetDTO()));
        mockMvc.perform(get("/contracts/getById/5")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCannotListOtherUsersContracts() throws Exception {
        when(contractAccess.isCurrentUser("otro")).thenReturn(false);
        when(contractAccess.canViewContracts()).thenReturn(true);
        mockMvc.perform(get("/contracts/getByUser/otro")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantWithoutContractsAccessCannotListOwnContracts() throws Exception {
        when(contractAccess.isCurrentUser("yo")).thenReturn(true);
        when(contractAccess.canViewContracts()).thenReturn(false);
        mockMvc.perform(get("/contracts/getByUser/yo")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCanListOwnContracts() throws Exception {
        when(contractAccess.isCurrentUser("yo")).thenReturn(true);
        when(contractAccess.canViewContracts()).thenReturn(true);
        when(contractService.getByUserId("yo")).thenReturn(ResponseEntity.ok(List.of()));
        mockMvc.perform(get("/contracts/getByUser/yo")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCannotUseGlobalListings() throws Exception {
        mockMvc.perform(get("/contracts/getByStatus").param("status", "ACTIVO")).andExpect(status().isForbidden());
        mockMvc.perform(get("/contracts/expiringWithinDays").param("days", "30")).andExpect(status().isForbidden());
        mockMvc.perform(get("/payments/getByConcept/ALQUILER")).andExpect(status().isForbidden());
        mockMvc.perform(get("/guarantors/getAll")).andExpect(status().isForbidden());
        mockMvc.perform(get("/guarantors/search").param("q", "a")).andExpect(status().isForbidden());
        mockMvc.perform(get("/contractUtilities/getByPeriodicity/MENSUAL")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCannotSeeOthersPaymentsOrDetails() throws Exception {
        when(contractAccess.canViewContract(anyLong())).thenReturn(false);
        when(contractAccess.canViewPayment(anyLong())).thenReturn(false);
        when(contractAccess.canViewCommission(anyLong())).thenReturn(false);
        when(contractAccess.canViewContractUtility(anyLong())).thenReturn(false);
        when(contractAccess.canViewContractIncrease(anyLong())).thenReturn(false);

        mockMvc.perform(get("/payments/getByContract/5")).andExpect(status().isForbidden());
        mockMvc.perform(get("/payments/getById/9")).andExpect(status().isForbidden());
        mockMvc.perform(get("/commissions/getById/3")).andExpect(status().isForbidden());
        mockMvc.perform(get("/contractUtilities/getById/3")).andExpect(status().isForbidden());
        mockMvc.perform(get("/contractIncreases/getById/3")).andExpect(status().isForbidden());
        mockMvc.perform(get("/guarantors/getByContract/5")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "user")
    void plainUserCannotSeeContracts() throws Exception {
        mockMvc.perform(get("/contracts/getById/5")).andExpect(status().isForbidden());
    }
}
