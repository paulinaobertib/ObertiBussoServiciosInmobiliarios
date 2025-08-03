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
import pi.ms_users.controller.FavoriteController;
import pi.ms_users.domain.Favorite;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.impl.FavoriteService;
import pi.ms_users.service.interf.IFavoriteService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FavoriteController.class)
@Import({FavoriteControllerTest.Config.class, WebSecurityConfig.class})
public class FavoriteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IFavoriteService favoriteService;

    @TestConfiguration
    static class Config {
        @Bean
        public FavoriteService favoriteService() {
            return Mockito.mock(FavoriteService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    // casos de exito

    @Test
    void createFavorite_shouldReturnOk() throws Exception {
        Favorite favorite = new Favorite();
        favorite.setId(1L);
        favorite.setUserId("user123");
        favorite.setPropertyId(100L);

        when(favoriteService.create(any(Favorite.class)))
                .thenReturn(ResponseEntity.ok(favorite));

        mockMvc.perform(post("/favorites/create")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(favorite)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void deleteFavorite_shouldReturnOk() throws Exception {
        when(favoriteService.delete(1L))
                .thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/favorites/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void getFavoritesByUserId_shouldReturnOk() throws Exception {
        Favorite favorite = new Favorite();
        favorite.setId(1L);
        favorite.setUserId("user123");
        favorite.setPropertyId(100L);

        when(favoriteService.findByUserId("user123"))
                .thenReturn(ResponseEntity.ok(List.of(favorite)));

        mockMvc.perform(get("/favorites/user/user123")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getFavoritesByPropertyId_shouldReturnOk() throws Exception {
        Favorite favorite = new Favorite();
        favorite.setId(1L);
        favorite.setUserId("user123");
        favorite.setPropertyId(100L);

        when(favoriteService.findByPropertyId(100L))
                .thenReturn(ResponseEntity.ok(List.of(favorite)));

        mockMvc.perform(get("/favorites/property/100")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getAllUsers_withAdminRole_shouldReturnListOfUsers() throws Exception {
        List<String> users = List.of("user1", "user2");

        when(favoriteService.findAllUsers()).thenReturn(users);

        mockMvc.perform(get("/favorites/internal/allUser")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0]").value("user1"))
                .andExpect(jsonPath("$[1]").value("user2"));
    }

    // casos de error

    @Test
    void createFavorite_unauthorized_shouldReturn401() throws Exception {
        Favorite favorite = new Favorite();
        favorite.setUserId("user123");
        favorite.setPropertyId(100L);

        mockMvc.perform(post("/favorites/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(favorite)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createFavorite_forbidden_shouldReturn403() throws Exception {
        Favorite favorite = new Favorite();
        favorite.setUserId("user123");
        favorite.setPropertyId(100L);

        mockMvc.perform(post("/favorites/create")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(favorite)))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteFavorite_notFound_shouldReturn404() throws Exception {
        when(favoriteService.delete(999L))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(delete("/favorites/delete/999")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteFavorite_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(delete("/favorites/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getFavoritesByUserId_unauthorized_shouldReturn401() throws Exception {
        mockMvc.perform(get("/favorites/user/user123"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getFavoritesByUserId_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(get("/favorites/user/user123")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_guest"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getFavoritesByPropertyId_forbidden_shouldReturn403() throws Exception {
        mockMvc.perform(get("/favorites/property/100")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getFavoritesByPropertyId_notFound_shouldReturn404() throws Exception {
        when(favoriteService.findByPropertyId(999L))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/favorites/property/999")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllUsers_withoutAdminRole_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/favorites/internal/allUser")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }
}
