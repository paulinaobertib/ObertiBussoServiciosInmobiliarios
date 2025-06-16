package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.MaintenanceController;
import pi.ms_properties.dto.MaintenanceDTO;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.MaintenanceService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MaintenanceController.class)
@Import({MaintenanceControllerTest.Config.class, WebSecurityConfig.class})
class MaintenanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MaintenanceService maintenanceService;

    private MaintenanceDTO validDTO;

    @TestConfiguration
    static class Config {
        @Bean
        public MaintenanceService maintenanceService() {
            return Mockito.mock(MaintenanceService.class);
        }
    }

    @BeforeEach
    void setUp() {
        validDTO = new MaintenanceDTO(
                1L,
                LocalDateTime.of(2024, 1, 1, 12, 0),
                "Revisión de gas",
                "Verificar instalación completa",
                10L
        );
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createMaintenance_success() throws Exception {
        when(maintenanceService.createMaintenance(any()))
                .thenReturn(ResponseEntity.ok("Mantenimiento creado exitosamente"));

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mockMvc.perform(post("/maintenance/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Mantenimiento creado exitosamente"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateMaintenance_success() throws Exception {
        when(maintenanceService.updateMaintenance(eq(1L), any()))
                .thenReturn(ResponseEntity.ok(validDTO));

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mockMvc.perform(put("/maintenance/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Revisión de gas"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteMaintenance_success() throws Exception {
        when(maintenanceService.deleteMaintenance(1L))
                .thenReturn(ResponseEntity.ok("Mantenimiento eliminado correctamente"));

        mockMvc.perform(delete("/maintenance/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Mantenimiento eliminado correctamente"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_success() throws Exception {
        when(maintenanceService.getById(1L))
                .thenReturn(ResponseEntity.ok(validDTO));

        mockMvc.perform(get("/maintenance/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Revisión de gas"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByPropertyId_success() throws Exception {
        List<MaintenanceDTO> list = List.of(validDTO);

        when(maintenanceService.getByPropertyId(10L))
                .thenReturn(ResponseEntity.ok(list));

        mockMvc.perform(get("/maintenance/getByPropertyId/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].propertyId").value(10L));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "admin")
    void updateMaintenance_notFound() throws Exception {
        when(maintenanceService.updateMaintenance(eq(99L), any()))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        mockMvc.perform(put("/maintenance/update/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDTO)))
                .andExpect(status().isNotFound());
    }


    @Test
    @WithMockUser(roles = "admin")
    void deleteMaintenance_notFound() throws Exception {
        when(maintenanceService.deleteMaintenance(99L))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Mantenimiento no encontrado"));

        mockMvc.perform(delete("/maintenance/delete/99"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Mantenimiento no encontrado"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_notFound() throws Exception {
        when(maintenanceService.getById(99L))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));

        mockMvc.perform(get("/maintenance/getById/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByPropertyId_emptyList() throws Exception {
        when(maintenanceService.getByPropertyId(20L))
                .thenReturn(ResponseEntity.ok(List.of()));

        mockMvc.perform(get("/maintenance/getByPropertyId/20"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
}