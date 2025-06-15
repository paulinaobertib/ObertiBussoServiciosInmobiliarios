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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.UserController;
import pi.ms_users.domain.User;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.impl.UserService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import({UserControllerTest.Config.class, WebSecurityConfig.class})
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @TestConfiguration
    static class Config {
        @Bean
        public UserService userService() {
            return Mockito.mock(UserService.class);
        }
    }

    // casos de exito

    @Test
    void findById_shouldReturnOk() throws Exception {
        User user = new User("1", "jdoe", "jdoe@mail.com", "John", "Doe", "123456");
        when(userService.findById("1")).thenReturn(ResponseEntity.ok(user));

        mockMvc.perform(get("/user/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1"));
    }

    @Test
    void findAll_shouldReturnOk() throws Exception {
        User user = new User("1", "jdoe", "jdoe@mail.com", "John", "Doe", "123456");
        when(userService.findAll()).thenReturn(ResponseEntity.ok(List.of(user)));

        mockMvc.perform(get("/user/getAll")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("1"));
    }

    @Test
    void deleteUser_shouldReturnOk() throws Exception {
        when(userService.deleteUserById("1")).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/user/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void exist_shouldReturnTrue() throws Exception {
        when(userService.exist("1")).thenReturn(true);

        mockMvc.perform(get("/user/exist/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void findRoles_shouldReturnOk() throws Exception {
        List<String> roles = List.of("ROLE_admin", "ROLE_user");
        when(userService.getUserRoles("1")).thenReturn(ResponseEntity.ok(roles));

        mockMvc.perform(get("/user/role/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("ROLE_admin"))
                .andExpect(jsonPath("$[1]").value("ROLE_user"));
    }

    @Test
    void deleteRoleToUser_shouldReturnOk() throws Exception {
        when(userService.deleteRoleToUser("1", "ROLE_user")).thenReturn(ResponseEntity.ok("Role deleted"));

        mockMvc.perform(delete("/user/delete/role/1")
                        .param("role", "ROLE_user")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Role deleted"));
    }

    @Test
    void updateUser_shouldReturnOk() throws Exception {
        User user = new User("1", "jdoe", "jdoe@mail.com", "John", "Doe", "123456");

        Mockito.<ResponseEntity<?>>when(userService.updateUser(any(User.class)))
                .thenReturn(ResponseEntity.ok(user));

        mockMvc.perform(put("/user/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "id": "1",
                              "username": "jdoe",
                              "email": "jdoe@mail.com",
                              "firstName": "John",
                              "lastName": "Doe",
                              "password": "123456"
                            }
                        """)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1"));
    }

    @Test
    void addRoleToUser_shouldReturnOk() throws Exception {
        List<String> roles = List.of("ROLE_admin", "ROLE_user");
        when(userService.addRoleToUser("1", "ROLE_user")).thenReturn(ResponseEntity.ok(roles));

        mockMvc.perform(put("/user/update/role/1")
                        .param("role", "ROLE_user")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("ROLE_admin"))
                .andExpect(jsonPath("$[1]").value("ROLE_user"));
    }

    @Test
    void searchUsersByText_shouldReturnOk() throws Exception {
        User user = new User("1", "jdoe", "jdoe@mail.com", "John", "Doe", "123456");
        List<User> users = List.of(user);
        when(userService.searchUsersByText("john")).thenReturn(ResponseEntity.ok(users));

        mockMvc.perform(get("/user/findUser")
                        .param("searchTerm", "john")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("1"))
                .andExpect(jsonPath("$[0].username").value("jdoe"));
    }

    // casos de error

    @Test
    void findById_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/user/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void findById_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(get("/user/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_guest"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void findAll_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(get("/user/getAll")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteUser_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(delete("/user/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_guest"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void exist_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/user/exist/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void exist_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(get("/user/exist/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_guest"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void findRoles_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/user/role/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void findRoles_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(get("/user/role/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteRoleToUser_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(delete("/user/delete/role/1")
                        .param("role", "ROLE_user"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteRoleToUser_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(delete("/user/delete/role/1")
                        .param("role", "ROLE_user")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }


    @Test
    void update_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(put("/user/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "id": "1",
                          "username": "jdoe",
                          "email": "jdoe@mail.com",
                          "firstName": "John",
                          "lastName": "Doe",
                          "password": "123456"
                        }
                    """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void update_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(put("/user/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "id": "1",
                          "username": "jdoe",
                          "email": "jdoe@mail.com",
                          "firstName": "John",
                          "lastName": "Doe",
                          "password": "123456"
                        }
                    """)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_guest"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void addRoleToUser_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(put("/user/update/role/1")
                        .param("role", "ROLE_user"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void addRoleToUser_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(put("/user/update/role/1")
                        .param("role", "ROLE_user")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void searchUsersByText_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(get("/user/findUser")
                        .param("searchTerm", "john")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void searchUsersByText_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/user/findUser")
                        .param("searchTerm", "john"))
                .andExpect(status().isUnauthorized());
    }
}

