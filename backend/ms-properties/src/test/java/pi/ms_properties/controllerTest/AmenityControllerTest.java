package pi.ms_properties.controllerTest;

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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.AmenityController;
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.AmenityService;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

@WebMvcTest(AmenityController.class)
@Import({AmenityControllerTest.Config.class, WebSecurityConfig.class})
class AmenityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AmenityService amenityService;

    @TestConfiguration
    static class Config {
        @Bean
        public AmenityService amenityService() {
            return Mockito.mock(AmenityService.class);
        }
    }

    // casos de exito

    @Test
    void createAmenity_shouldReturnOk() throws Exception {
        when(amenityService.createAmenity("WiFi"))
                .thenReturn(ResponseEntity.ok("Amenity created"));

        mockMvc.perform(post("/amenity/create")
                        .param("name", "WiFi")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Amenity created"));
    }

    @Test
    void deleteAmenity_shouldReturnOk() throws Exception {
        when(amenityService.deleteAmenity(1L))
                .thenReturn(ResponseEntity.ok("Amenity deleted"));

        mockMvc.perform(delete("/amenity/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Amenity deleted"));
    }

    @Test
    void updateAmenity_shouldReturnOk() throws Exception {
        Amenity amenity = new Amenity();
        amenity.setId(1L);
        amenity.setName("WiFi");

        when(amenityService.updateAmenity(any(Amenity.class)))
                .thenReturn(ResponseEntity.ok(amenity));

        String body = "{\"id\":1, \"name\":\"WiFi\"}";

        mockMvc.perform(put("/amenity/update")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("WiFi"));
    }

    @Test
    void getAll_shouldReturnOk() throws Exception {
        Amenity amenity1 = new Amenity();
        amenity1.setId(1L);
        amenity1.setName("WiFi");

        Amenity amenity2 = new Amenity();
        amenity2.setId(2L);
        amenity2.setName("Garage");

        List<Amenity> list = Arrays.asList(amenity1, amenity2);

        when(amenityService.getAll()).thenReturn(ResponseEntity.ok(list));

        mockMvc.perform(get("/amenity/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_shouldReturnOk() throws Exception {
        Amenity amenity = new Amenity();
        amenity.setId(1L);
        amenity.setName("WiFi");

        when(amenityService.getById(1L))
                .thenReturn(ResponseEntity.ok(amenity));

        mockMvc.perform(get("/amenity/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("WiFi"));
    }

    @Test
    void searchAmenity_shouldReturnOk_withResults() throws Exception {
        Amenity amenity1 = new Amenity();
        amenity1.setId(1L);
        amenity1.setName("WiFi");

        Amenity amenity2 = new Amenity();
        amenity2.setId(2L);
        amenity2.setName("Garage");

        List<Amenity> resultList = Arrays.asList(amenity1, amenity2);

        when(amenityService.findBy("Wi")).thenReturn(ResponseEntity.ok(resultList));

        mockMvc.perform(get("/amenity/search")
                        .param("search", "Wi")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("WiFi"))
                .andExpect(jsonPath("$[1].name").value("Garage"));
    }

    // casos de error

    @Test
    void createAmenity_shouldReturnUnauthorized_whenNoUser() throws Exception {
        mockMvc.perform(post("/amenity/create").param("name", "WiFi"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "user")
    void deleteAmenity_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(delete("/amenity/delete/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "user")
    void updateAmenity_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(put("/amenity/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\": 1, \"name\": \"WiFi\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void createAmenity_shouldReturnBadRequest_whenNameMissing() throws Exception {
        mockMvc.perform(post("/amenity/create")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateAmenity_shouldReturnBadRequest_whenBodyInvalid() throws Exception {
        mockMvc.perform(put("/amenity/update")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("")) // cuerpo vacío
                .andExpect(status().isBadRequest());
    }

    @Test
    void getById_shouldReturnServerError_whenServiceThrowsException() throws Exception {
        when(amenityService.getById(999L)).thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/amenity/getById/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void searchAmenity_shouldReturnEmptyList_whenNoResults() throws Exception {
        when(amenityService.findBy("XYZ")).thenReturn(ResponseEntity.ok(Collections.emptyList()));

        mockMvc.perform(get("/amenity/search")
                        .param("search", "XYZ")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void searchAmenity_shouldReturnUnauthorized_whenNoUser() throws Exception {
        mockMvc.perform(get("/amenity/search")
                        .param("search", "Wi"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void searchAmenity_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/amenity/search")
                        .param("search", "Wi")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }
}
