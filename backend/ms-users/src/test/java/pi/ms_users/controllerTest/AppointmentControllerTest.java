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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.AppointmentController;
import pi.ms_users.domain.Appointment;
import pi.ms_users.domain.AppointmentStatus;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.impl.AppointmentService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@WebMvcTest(AppointmentController.class)
@Import({AppointmentControllerTest.Config.class, WebSecurityConfig.class})
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppointmentService appointmentService;

    @TestConfiguration
    static class Config {
        @Bean
        public AppointmentService appointmentService() {
            return Mockito.mock(AppointmentService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    // casos de exito

    @Test
    void createAppointment_shouldReturnOk() throws Exception {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        appointment.setDate(LocalDateTime.now());
        appointment.setStatus(AppointmentStatus.ESPERA);

        when(appointmentService.create(any(Appointment.class)))
                .thenReturn(ResponseEntity.ok(appointment));

        mockMvc.perform(post("/appointments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    // @WithMockUser(roles = "user")
    void deleteAppointment_shouldReturnOk() throws Exception {
        when(appointmentService.delete(1L))
                .thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/appointments/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void updateStatus_shouldReturnOk() throws Exception {
        when(appointmentService.updateStatus(1L, AppointmentStatus.ACEPTADO))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/appointments/status/1")
                        .param("status", "ACEPTADO")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
        )
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    void getAppointmentById_shouldReturnOk() throws Exception {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUserId("user123");
        appointment.setDate(LocalDateTime.now());
        appointment.setStatus(AppointmentStatus.ESPERA);

        when(appointmentService.findById(1L)).thenReturn(ResponseEntity.ok(appointment));

        mockMvc.perform(get("/appointments/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getAllAppointments_shouldReturnOk() throws Exception {
        Appointment a1 = new Appointment();
        a1.setId(1L);
        a1.setUserId("user1");
        a1.setDate(LocalDateTime.now());
        a1.setStatus(AppointmentStatus.ESPERA);

        Appointment a2 = new Appointment();
        a2.setId(2L);
        a2.setUserId("user2");
        a2.setDate(LocalDateTime.now());
        a2.setStatus(AppointmentStatus.ACEPTADO);

        List<Appointment> list = List.of(a1, a2);

        when(appointmentService.findAll()).thenReturn(ResponseEntity.ok(list));

        mockMvc.perform(get("/appointments/getAll")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getAppointmentsByUser_shouldReturnOk() throws Exception {
        Appointment a = new Appointment();
        a.setId(1L);
        a.setUserId("user123");
        a.setDate(LocalDateTime.now());
        a.setStatus(AppointmentStatus.ESPERA);

        when(appointmentService.findByUserId("user123"))
                .thenReturn(ResponseEntity.ok(List.of(a)));

        mockMvc.perform(get("/appointments/user/user123")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // casos de error

//     @Test
//     void deleteAppointment_shouldReturnForbidden_whenAdmin() throws Exception {
//         mockMvc.perform(delete("/appointments/delete/1")
//                         // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
//         )
//                 .andExpect(status().isForbidden());
//     }

//     @Test
//     void updateStatus_shouldReturnForbidden_whenNotAdmin() throws Exception {
//         mockMvc.perform(put("/appointments/status/1")
//                         .param("status", "ACEPTADO")
//                         .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
//                 .andExpect(status().isForbidden());
//     }

//     @Test
//     void getAllAppointments_shouldReturnForbidden_whenNotAdmin() throws Exception {
//         mockMvc.perform(get("/appointments/getAll")
//                         .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
//                 .andExpect(status().isForbidden());
//     }

    @Test
    void createAppointment_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/appointments/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAppointmentById_shouldReturnNotFound_whenServiceReturns404() throws Exception {
        when(appointmentService.findById(999L))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/appointments/getById/999")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isNotFound());
    }
}

