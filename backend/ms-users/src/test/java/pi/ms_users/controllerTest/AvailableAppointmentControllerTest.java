package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.EntityNotFoundException;
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
import pi.ms_users.controller.AvailableAppointmentController;
import pi.ms_users.domain.AvailableAppointment;
import pi.ms_users.dto.AvailableAppointmentDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IAvailableAppointmentService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AvailableAppointmentController.class)
@Import({AvailableAppointmentControllerTest.Config.class, WebSecurityConfig.class})
class AvailableAppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IAvailableAppointmentService availableAppointmentService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @TestConfiguration
    static class Config {
        @Bean
        public IAvailableAppointmentService availableAppointmentService() {
            return Mockito.mock(IAvailableAppointmentService.class);
        }
    }

    // casos de exito

    @Test
    void create_shouldReturnOk_whenAdmin() throws Exception {
        AvailableAppointmentDTO dto = new AvailableAppointmentDTO();
        dto.setDate(LocalDate.of(2025, 6, 30));
        dto.setStartTime(LocalTime.of(10, 0));
        dto.setEndTime(LocalTime.of(11, 0));

        String json = new ObjectMapper()
                .findAndRegisterModules()
                .writeValueAsString(dto);

        when(availableAppointmentService.create(any())).thenReturn(ResponseEntity.ok("Creado"));

        mockMvc.perform(post("/availableAppointments/create")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(content().string("Creado"));
    }

    @Test
    void updateAvailability_shouldReturnOk_whenAdmin() throws Exception {
        when(availableAppointmentService.updateAvailability(1L)).thenReturn(ResponseEntity.ok("Actualizado"));

        mockMvc.perform(patch("/availableAppointments/updateAvailability/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Actualizado"));
    }

    @Test
    void deleteAvailability_shouldReturnOk_whenAdmin() throws Exception {
        when(availableAppointmentService.deleteAvailability(1L)).thenReturn(ResponseEntity.ok("Eliminado"));

        mockMvc.perform(delete("/availableAppointments/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Eliminado"));
    }

    @Test
    void getById_shouldReturnOk_whenAdmin() throws Exception {
        AvailableAppointment appointment = new AvailableAppointment();
        appointment.setId(1L);

        when(availableAppointmentService.getById(1L)).thenReturn(ResponseEntity.ok(appointment));

        mockMvc.perform(get("/availableAppointments/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getAll_shouldReturnOk_whenAdmin() throws Exception {
        AvailableAppointment a1 = new AvailableAppointment();
        a1.setId(1L);
        AvailableAppointment a2 = new AvailableAppointment();
        a2.setId(2L);

        when(availableAppointmentService.getAll()).thenReturn(ResponseEntity.ok(List.of(a1, a2)));

        mockMvc.perform(get("/availableAppointments/getAll")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getAvailable_shouldReturnOk_whenAdmin() throws Exception {
        when(availableAppointmentService.availableAppointments())
                .thenReturn(ResponseEntity.ok(List.of(new AvailableAppointment())));

        mockMvc.perform(get("/availableAppointments/available")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk());
    }

    @Test
    void getUnavailable_shouldReturnOk_whenAdmin() throws Exception {
        when(availableAppointmentService.noAvailableAppointments())
                .thenReturn(ResponseEntity.ok(List.of(new AvailableAppointment())));

        mockMvc.perform(get("/availableAppointments/unavailable")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk());
    }

    // casos de error

    @Test
    void create_shouldReturnForbidden_whenNotAdmin() throws Exception {
        String json = """
            {
                "date": "2025-07-01T10:00:00",
                "availability": true
            }
            """;

        mockMvc.perform(post("/availableAppointments/create")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnNotFound_whenEntityNotFound() throws Exception {
        when(availableAppointmentService.getById(99L))
                .thenThrow(new EntityNotFoundException("No encontrado"));

        mockMvc.perform(get("/availableAppointments/getById/99")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isNotFound());
    }
}
