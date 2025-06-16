package pi.ms_properties.controllerTest;

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
import pi.ms_properties.controller.ViewController;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.ViewService;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ViewController.class)
@Import({ViewControllerTest.Config.class, WebSecurityConfig.class})
class ViewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ViewService viewService;

    @TestConfiguration
    static class Config {
        @Bean
        public ViewService viewService() {
            return Mockito.mock(ViewService.class);
        }
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void testGetByPropertySuccess() throws Exception {
        Mockito.when(viewService.getViewsByProperty())
                .thenReturn(ResponseEntity.ok(Map.of("Property1", 10L)));

        mockMvc.perform(get("/view/property"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Property1").value(10));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetByPropertyTypeSuccess() throws Exception {
        Mockito.when(viewService.getViewsByPropertyType())
                .thenReturn(ResponseEntity.ok(Map.of("Apartment", 5L)));

        mockMvc.perform(get("/view/propertyType"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Apartment").value(5));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetByDaySuccess() throws Exception {
        Mockito.when(viewService.getViewsByDay())
                .thenReturn(ResponseEntity.ok(Map.of("2025-05-20", 7L)));

        mockMvc.perform(get("/view/day"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['2025-05-20']").value(7));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetByMonthSuccess() throws Exception {
        Mockito.when(viewService.getViewsByMonth())
                .thenReturn(ResponseEntity.ok(Map.of("2025-05", 12L)));

        mockMvc.perform(get("/view/month"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['2025-05']").value(12));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetByNeighborhoodSuccess() throws Exception {
        Mockito.when(viewService.getViewsByNeighborhood())
                .thenReturn(ResponseEntity.ok(Map.of("Downtown", 8L)));

        mockMvc.perform(get("/view/neighborhood"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Downtown").value(8));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetByNeighborhoodTypeSuccess() throws Exception {
        Mockito.when(viewService.getViewsByNeighborhoodType())
                .thenReturn(ResponseEntity.ok(Map.of("Residential", 6L)));

        mockMvc.perform(get("/view/neighborhoodType"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Residential").value(6));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetViewsByStatusSuccess() throws Exception {
        Mockito.when(viewService.getViewsByStatus())
                .thenReturn(ResponseEntity.ok(Map.of("Available", 4L)));

        mockMvc.perform(get("/view/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Available").value(4));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetViewsByStatusAndTypeSuccess() throws Exception {
        Map<String, Long> innerMap = Map.of("Apartment", 3L);
        Mockito.when(viewService.getViewsByStatusAndType())
                .thenReturn(ResponseEntity.ok(Map.of("Available", innerMap)));

        mockMvc.perform(get("/view/statusAndType"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Available.Apartment").value(3));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetByOperationSuccess() throws Exception {
        Mockito.when(viewService.getViewsByOperation())
                .thenReturn(ResponseEntity.ok(Map.of("Rent", 9L)));

        mockMvc.perform(get("/view/operation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Rent").value(9));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetByRoomsSuccess() throws Exception {
        Mockito.when(viewService.getViewsByRooms())
                .thenReturn(ResponseEntity.ok(Map.of(3.0f, 5L)));

        mockMvc.perform(get("/view/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['3.0']").value(5));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetByAmenitySuccess() throws Exception {
        Mockito.when(viewService.getViewsByAmenity())
                .thenReturn(ResponseEntity.ok(Map.of("Pool", 7L)));

        mockMvc.perform(get("/view/amenity"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Pool").value(7));
    }

    // casos de error

    @Test
    void testGetByPropertyWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/property"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByPropertyTypeWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/propertyType"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByDayWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/day"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByMonthWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/month"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByNeighborhoodWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/neighborhood"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByNeighborhoodTypeWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/neighborhoodType"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByStatusWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/status"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByStatusAndTypeWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/statusAndType"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByOperationWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/operation"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByRoomsWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/rooms"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetByAmenityWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/view/amenity"))
                .andExpect(status().isUnauthorized());
    }
}

