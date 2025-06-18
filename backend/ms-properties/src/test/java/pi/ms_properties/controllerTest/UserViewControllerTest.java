package pi.ms_properties.controllerTest;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.UserViewController;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.UserView;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.interf.IUserViewService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

@WebMvcTest(UserViewController.class)
@Import({UserViewControllerTest.Config.class, WebSecurityConfig.class})
class UserViewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IUserViewService userViewService;

    @TestConfiguration
    static class Config {
        @Bean
        public IUserViewService userViewService() {
            return Mockito.mock(IUserViewService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UserView buildValidUserView() {
        Property property = new Property();
        property.setId(1L);

        UserView userView = new UserView();
        userView.setUserId("user123");
        userView.setProperty(property);
        return userView;
    }

    // casos de exito

    @Test
    void createUserView_shouldReturnOk_whenUserHasValidRole() throws Exception {
        UserView userView = buildValidUserView();

        mockMvc.perform(post("/userViews/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userView))
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk());
    }

    // casos de error

    @Test
    void createUserView_shouldReturnUnauthorized_whenNoToken() throws Exception {
        UserView userView = buildValidUserView();

        mockMvc.perform(post("/userViews/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userView)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createUserView_shouldReturnForbidden_whenUserIsAdmin() throws Exception {
        UserView userView = buildValidUserView();

        mockMvc.perform(post("/userViews/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userView))
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void createUserView_shouldReturnBadRequest_whenBodyIsInvalid() throws Exception {
        String invalidJson = "{ \"userId\": \"user123\" ";

        mockMvc.perform(post("/userViews/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isBadRequest());

        verify(userViewService, never()).create(any());
    }

    @Test
    void createUserView_shouldReturnInternalServerError_whenServiceThrowsException() throws Exception {
        UserView userView = buildValidUserView();

        doThrow(new RuntimeException("Algo salió mal"))
                .when(userViewService).create(any(UserView.class));

        mockMvc.perform(post("/userViews/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userView))
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isInternalServerError());
    }
}