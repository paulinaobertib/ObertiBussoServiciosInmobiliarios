package pi.ms_users.controllerTest;

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
import pi.ms_users.controller.PortalAccessController;
import pi.ms_users.dto.portal.PortalAccessDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IPortalAccessService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PortalAccessController.class)
@Import({PortalAccessControllerTest.Config.class, WebSecurityConfig.class})
class PortalAccessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IPortalAccessService portalAccessService;

    @TestConfiguration
    static class Config {
        @Bean
        public IPortalAccessService portalAccessService() {
            return Mockito.mock(IPortalAccessService.class);
        }
    }

    @Test
    @WithMockUser(roles = "tenant")
    void anyLoggedUserReadsOwnAccess() throws Exception {
        when(portalAccessService.getMine()).thenReturn(ResponseEntity.ok(new PortalAccessDTO("t1", false, true)));
        mockMvc.perform(get("/portalAccess/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canViewReceipts").value(true))
                .andExpect(jsonPath("$.canViewContracts").value(false));
    }

    @Test
    void anonymousIsRejected() throws Exception {
        mockMvc.perform(get("/portalAccess/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCannotChangeAccess() throws Exception {
        mockMvc.perform(put("/portalAccess/t1").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"canViewContracts\":true,\"canViewReceipts\":true}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void adminChangesAccess() throws Exception {
        when(portalAccessService.update(eq("t1"), any())).thenReturn(ResponseEntity.ok(new PortalAccessDTO("t1", false, true)));
        mockMvc.perform(put("/portalAccess/t1").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"canViewContracts\":false,\"canViewReceipts\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canViewReceipts").value(true));
    }
}
