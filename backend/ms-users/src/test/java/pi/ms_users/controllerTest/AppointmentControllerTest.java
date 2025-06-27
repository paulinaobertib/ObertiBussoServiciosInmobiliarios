package pi.ms_users.controllerTest;

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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.AppointmentController;
import pi.ms_users.domain.Appointment;
import pi.ms_users.domain.AppointmentStatus;
import pi.ms_users.domain.AvailableAppointment;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.impl.AppointmentService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import pi.ms_users.service.interf.IAppointmentService;

@WebMvcTest(AppointmentController.class)
@Import({AppointmentControllerTest.Config.class, WebSecurityConfig.class})
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IAppointmentService appointmentService;

    @TestConfiguration
    static class Config {
        @Bean
        public AppointmentService appointmentService() {
            return Mockito.mock(AppointmentService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private AvailableAppointment getSampleAvailableAppointment() {
        AvailableAppointment available = new AvailableAppointment();
        available.setId(10L);
        available.setDate(LocalDateTime.now());
        available.setAvailability(true);
        return available;
    }

    // casos de exito

    @Test
    void createAppointment_shouldReturnOk() throws Exception {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        appointment.setStatus(AppointmentStatus.ESPERA);
        appointment.setAvailableAppointment(getSampleAvailableAppointment());

        when(appointmentService.create(any(Appointment.class)))
                .thenReturn(ResponseEntity.ok(appointment));

        mockMvc.perform(post("/appointments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(roles = "user")
    void deleteAppointment_shouldReturnOk() throws Exception {
        when(appointmentService.delete(1L))
                .thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/appointments/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateStatus_shouldReturnOk() throws Exception {
        when(appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO, null))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/appointments/status/1")
                        .param("status", "ACEPTADO"))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "user")
    void getAppointmentById_shouldReturnOk() throws Exception {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        appointment.setStatus(AppointmentStatus.ESPERA);
        appointment.setAvailableAppointment(getSampleAvailableAppointment());

        when(appointmentService.findById(1L)).thenReturn(ResponseEntity.ok(appointment));

        mockMvc.perform(get("/appointments/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAllAppointments_shouldReturnOk() throws Exception {
        Appointment a1 = new Appointment();
        a1.setId(1L);
        a1.setUserId("user1");
        a1.setStatus(AppointmentStatus.ESPERA);
        a1.setAvailableAppointment(getSampleAvailableAppointment());

        Appointment a2 = new Appointment();
        a2.setId(2L);
        a2.setUserId("user2");
        a2.setStatus(AppointmentStatus.ACEPTADO);
        a2.setAvailableAppointment(getSampleAvailableAppointment());

        List<Appointment> list = List.of(a1, a2);

        when(appointmentService.findAll()).thenReturn(ResponseEntity.ok(list));

        mockMvc.perform(get("/appointments/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(roles = "user")
    void getAppointmentsByUser_shouldReturnOk() throws Exception {
        Appointment a = new Appointment();
        a.setId(1L);
        a.setUserId("user123");
        a.setStatus(AppointmentStatus.ESPERA);
        a.setAvailableAppointment(getSampleAvailableAppointment());

        when(appointmentService.findByUserId("user123"))
                .thenReturn(ResponseEntity.ok(List.of(a)));

        mockMvc.perform(get("/appointments/user/user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "user")
    void testGetAppointmentsByStatus_ReturnsListOfAppointments() throws Exception {
        AppointmentStatus status = AppointmentStatus.ESPERA;

        Appointment a1 = new Appointment();
        a1.setId(1L);
        a1.setUserId("user1");
        a1.setStatus(status);

        Appointment a2 = new Appointment();
        a2.setId(2L);
        a2.setUserId("user2");
        a2.setStatus(status);

        List<Appointment> expectedAppointments = List.of(a1, a2);

        when(appointmentService.findByStatus(status)).thenReturn(ResponseEntity.ok(expectedAppointments));

        mockMvc.perform(get("/appointments/status")
                        .param("status", "ESPERA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[1].userId").value("user2"));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "admin")
    void deleteAppointment_shouldReturnForbidden_whenAdmin() throws Exception {
        mockMvc.perform(delete("/appointments/delete/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "user")
    void updateStatus_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(put("/appointments/status/1")
                        .param("status", "ACEPTADO"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "user")
    void getAllAppointments_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/appointments/getAll"))
                .andExpect(status().isForbidden());
    }

    @Test
    void createAppointment_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/appointments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "user")
    void getAppointmentById_shouldReturnNotFound_whenServiceReturns404() throws Exception {
        when(appointmentService.findById(999L))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/appointments/getById/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "user")
    void testGetAppointmentsByStatus_NotFound() throws Exception {
        AppointmentStatus status = AppointmentStatus.ESPERA;

        when(appointmentService.findByStatus(status))
                .thenThrow(new EntityNotFoundException("No se encontraron turnos con ese estado"));

        mockMvc.perform(get("/appointments/status")
                        .param("status", "ESPERA"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("No se encontraron turnos con ese estado"));
    }

    @Test
    void testGetAppointmentsByStatus_Unauthorized() throws Exception {
        mockMvc.perform(get("/appointments/status")
                        .param("status", "ESPERA"))
                .andExpect(status().isUnauthorized());
    }
}