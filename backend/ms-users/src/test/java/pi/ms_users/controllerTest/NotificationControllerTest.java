package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import pi.ms_users.controller.NotificationController;
import pi.ms_users.domain.Notification;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.dto.NotificationDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.impl.NotificationService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
@Import({NotificationControllerTest.Config.class, WebSecurityConfig.class})
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationService notificationService;

    @TestConfiguration
    static class Config {
        @Bean
        public NotificationService notificationService() {
            return Mockito.mock(NotificationService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    // casos de exito

    @Test
    void createProperty_success_adminRole_shouldReturnOk() throws Exception {
        NotificationDTO dto = new NotificationDTO();
        dto.setType(NotificationType.PROPIEDADNUEVA);
        dto.setDate(LocalDateTime.now());

        when(notificationService.createProperty(any(NotificationDTO.class), eq(123L)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/notifications/create/property")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("propertyId", "123")
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    void getById_success_userRole_shouldReturnNotification() throws Exception {
        Notification notification = new Notification();
        notification.setId(1L);
        notification.setUserId("user123");
        notification.setType(NotificationType.PROPIEDADNUEVA);
        notification.setDate(LocalDateTime.now());

        when(notificationService.getById(1L))
                .thenReturn(ResponseEntity.ok(notification));

        mockMvc.perform(get("/notifications/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value("user123"))
                .andExpect(jsonPath("$.type").value("PROPIEDADNUEVA"));
    }

    @Test
    void getAll_success_adminRole_shouldReturnList() throws Exception {
        Notification notification = new Notification();
        notification.setId(1L);
        notification.setUserId("user123");
        notification.setType(NotificationType.PROPIEDADNUEVA);
        notification.setDate(LocalDateTime.now());

        when(notificationService.getAll())
                .thenReturn(ResponseEntity.ok(List.of(notification)));

        mockMvc.perform(get("/notifications/getAll")
                        // .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].userId").value("user123"));
    }

    @Test
    void getByUserId_success_userRole_shouldReturnList() throws Exception {
        Notification notification = new Notification();
        notification.setId(1L);
        notification.setUserId("user123");
        notification.setType(NotificationType.PROPIEDADNUEVA);
        notification.setDate(LocalDateTime.now());

        when(notificationService.getByUserId("user123"))
                .thenReturn(ResponseEntity.ok(List.of(notification)));

        mockMvc.perform(get("/notifications/user/user123")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value("user123"));
    }

    // casos de error

//     @Test
//     void createProperty_unauthorized_shouldReturn401() throws Exception {
//         NotificationDTO dto = new NotificationDTO();
//         dto.setType(NotificationType.PROPIEDADNUEVA);
//         dto.setDate(LocalDateTime.now());

//         mockMvc.perform(post("/notifications/create/property")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .param("propertyId", "123")
//                         .content(objectMapper.writeValueAsString(dto)))
//                 .andExpect(status().isUnauthorized());
//     }

//     @Test
//     void createProperty_forbidden_userRole_shouldReturn403() throws Exception {
//         NotificationDTO dto = new NotificationDTO();
//         dto.setType(NotificationType.PROPIEDADNUEVA);
//         dto.setDate(LocalDateTime.now());

//         mockMvc.perform(post("/notifications/create/property")
//                         .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user")))
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .param("propertyId", "123")
//                         .content(objectMapper.writeValueAsString(dto)))
//                 .andExpect(status().isForbidden());
//     }

//     @Test
//     void getById_unauthorized_shouldReturn401() throws Exception {
//         mockMvc.perform(get("/notifications/getById/1"))
//                 .andExpect(status().isUnauthorized());
//     }

    @Test
    void getById_notFound_shouldReturn404() throws Exception {
        when(notificationService.getById(999L)).thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/notifications/getById/999")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isNotFound());
    }

//     @Test
//     void getAll_unauthorized_shouldReturn401() throws Exception {
//         mockMvc.perform(get("/notifications/getAll"))
//                 .andExpect(status().isUnauthorized());
//     }

//     @Test
//     void getAll_forbidden_userRole_shouldReturn403() throws Exception {
//         mockMvc.perform(get("/notifications/getAll")
//                         .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
//                 .andExpect(status().isForbidden());
//     }

//     @Test
//     void getByUserId_unauthorized_shouldReturn401() throws Exception {
//         mockMvc.perform(get("/notifications/user/user123"))
//                 .andExpect(status().isUnauthorized());
//     }

    @Test
    void getByUserId_noResults_shouldReturnEmptyList() throws Exception {
        when(notificationService.getByUserId("user123")).thenReturn(ResponseEntity.ok(List.of()));

        mockMvc.perform(get("/notifications/user/user123")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
}

