package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import pi.ms_users.controller.UserNotificationPreferenceController;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.UserNotificationPreference;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.impl.UserNotificationPreferenceService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserNotificationPreferenceController.class)
@Import({UserNotificationPreferenceControllerTest.Config.class, WebSecurityConfig.class})
public class UserNotificationPreferenceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserNotificationPreferenceService service;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @TestConfiguration
    static class Config {
        @Bean
        public UserNotificationPreferenceService userNotificationPreferenceService() {
            return Mockito.mock(UserNotificationPreferenceService.class);
        }
    }

    // casos de exito

    @Test
    void create_shouldReturnOk() throws Exception {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setUserId("123");
        pref.setType(NotificationType.PROPIEDADNUEVA);
        pref.setEnabled(true);

        Mockito.when(service.create(any())).thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/preference/create")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pref)))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    void update_shouldReturnOk() throws Exception {
        Mockito.when(service.update(eq(1L), eq(true))).thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/preference/update/1")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .param("enabled", "true"))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    void getById_shouldReturnOk() throws Exception {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setId(1L);
        pref.setUserId("123");
        pref.setType(NotificationType.PROPIEDADNUEVA);
        pref.setEnabled(true);

        Mockito.when(service.getById(1L)).thenReturn(ResponseEntity.ok(pref));

        mockMvc.perform(get("/preference/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getByUser_shouldReturnOk() throws Exception {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.setId(1L);
        pref.setUserId("123");
        pref.setType(NotificationType.PROPIEDADNUEVA);
        pref.setEnabled(true);

        Mockito.when(service.getByUser("123")).thenReturn(ResponseEntity.ok(List.of(pref)));

        mockMvc.perform(get("/preference/user/123")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value("123"));
    }

    @Test
    void getByTypeAndTrue_shouldReturnOk() throws Exception {
        Mockito.when(service.getByTypeAndTrue(NotificationType.PROPIEDADNUEVA))
                .thenReturn(ResponseEntity.ok(List.of("user1", "user2")));

        mockMvc.perform(get("/preference/active")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .param("type", "PROPIEDADNUEVA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("user1"));
    }

    // casos de error

    @Test
    void create_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(post("/preference/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getByTypeAndTrue_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(get("/preference/active")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user")))
                        .param("type", "PROPIEDADNUEVA"))
                .andExpect(status().isForbidden());
    }

    @Test
    void update_withMissingParam_shouldReturn400() throws Exception {
        mockMvc.perform(put("/preference/update/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update_invalidId_shouldReturn404() throws Exception {
        Mockito.when(service.update(eq(999L), eq(true)))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(put("/preference/update/999")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .param("enabled", "true"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getById_notFound_shouldReturn404() throws Exception {
        Mockito.when(service.getById(999L)).thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/preference/getById/999")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void getByUser_notFound_shouldReturn404() throws Exception {
        Mockito.when(service.getByUser("nonexistent")).thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/preference/user/nonexistent")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void getByTypeAndTrue_invalidEnum_shouldReturn400() throws Exception {
        mockMvc.perform(get("/preference/active")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .param("type", "INVALID_TYPE"))
                .andExpect(status().isBadRequest());
    }
}
