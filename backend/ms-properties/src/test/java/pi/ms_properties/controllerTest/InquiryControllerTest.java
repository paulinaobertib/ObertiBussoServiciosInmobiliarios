package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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
import pi.ms_properties.controller.InquiryController;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;
import pi.ms_properties.dto.InquiryGetDTO;
import pi.ms_properties.dto.InquirySaveDTO;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.interf.IInquiryService;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InquiryController.class)
@Import({InquiryControllerTest.Config.class, WebSecurityConfig.class})
class InquiryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IInquiryService inquiryService;

    @Autowired
    private ObjectMapper objectMapper;

    private InquirySaveDTO sampleDTO;
    private Inquiry sampleInquiry;

    @TestConfiguration
    static class Config {
        @Bean
        public IInquiryService inquiryService() {
            return Mockito.mock(IInquiryService.class);
        }
    }

    @BeforeEach
    void setup() {
        sampleDTO = new InquirySaveDTO(
                null,
                "user123",
                "123456789",
                "test@example.com",
                "Juan",
                "Pérez",
                "Consulta sobre propiedad",
                "Quiero saber más detalles sobre la propiedad.",
                List.of(1L, 2L)
        );

        sampleInquiry = new Inquiry();
        sampleInquiry.setId(1L);
        sampleInquiry.setUserId("user123");
        sampleInquiry.setPhone("123456789");
        sampleInquiry.setEmail("test@example.com");
        sampleInquiry.setFirstName("Juan");
        sampleInquiry.setLastName("Pérez");
        sampleInquiry.setDate(LocalDateTime.now());
        sampleInquiry.setTitle("Consulta sobre propiedad");
        sampleInquiry.setDescription("Quiero saber más detalles sobre la propiedad.");
        sampleInquiry.setStatus(InquiryStatus.ABIERTA);
        sampleInquiry.setDateClose(null);
        sampleInquiry.setProperties(List.of());
    }

    private InquiryGetDTO sampleInquiryGetDTO() {
        InquiryGetDTO dto = new InquiryGetDTO();
        dto.setId(1L);
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setEmail("john@example.com");
        dto.setPhone("123456789");
        dto.setTitle("Consulta");
        dto.setDescription("Descripción");
        dto.setStatus(InquiryStatus.ABIERTA);
        dto.setDate(LocalDateTime.now());
        dto.setDateClose(null);
        dto.setPropertyTitles(List.of("Propiedad 1", "Propiedad 2"));
        return dto;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "user")
    void createInquiry_success() throws Exception {
        Mockito.when(inquiryService.create(any())).thenReturn(ResponseEntity.ok("Creada"));

        mockMvc.perform(post("/inquiries/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Creada"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateStatus_success() throws Exception {
        Mockito.when(inquiryService.updateStatus(1L))
                .thenReturn(ResponseEntity.ok("Actualizada"));

        mockMvc.perform(put("/inquiries/status/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Actualizada"));
    }

    @Test
    @WithMockUser(roles = "user")
    void getById_success() throws Exception {
        InquiryGetDTO sampleDTO = new InquiryGetDTO();
        sampleDTO.setId(1L);
        sampleDTO.setFirstName("Juan");
        sampleDTO.setLastName("Pérez");
        sampleDTO.setEmail("juan@example.com");
        sampleDTO.setPhone("123456789");
        sampleDTO.setTitle("Consulta");
        sampleDTO.setDescription("Descripción");
        sampleDTO.setStatus(InquiryStatus.ABIERTA);
        sampleDTO.setDate(LocalDateTime.now());
        sampleDTO.setPropertyTitles(List.of("Propiedad A"));

        Mockito.when(inquiryService.getById(1L))
                .thenReturn(ResponseEntity.ok(sampleDTO));

        mockMvc.perform(get("/inquiries/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("Juan"))
                .andExpect(jsonPath("$.propertyTitles[0]").value("Propiedad A"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAll_success() throws Exception {
        InquiryGetDTO sampleDTO = new InquiryGetDTO();
        sampleDTO.setId(1L);
        sampleDTO.setFirstName("Juan");
        sampleDTO.setLastName("Pérez");
        sampleDTO.setEmail("juan@example.com");
        sampleDTO.setPhone("123456789");
        sampleDTO.setTitle("Consulta");
        sampleDTO.setDescription("Descripción");
        sampleDTO.setStatus(InquiryStatus.ABIERTA);
        sampleDTO.setDate(LocalDateTime.now());
        sampleDTO.setPropertyTitles(List.of("Propiedad A"));

        Mockito.when(inquiryService.getAll())
                .thenReturn(ResponseEntity.ok(List.of(sampleDTO)));

        mockMvc.perform(get("/inquiries/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].firstName").value("Juan"))
                .andExpect(jsonPath("$[0].propertyTitles[0]").value("Propiedad A"));
    }

    @Test
    @WithMockUser(roles = "user")
    void getByUserId_success() throws Exception {
        InquiryGetDTO sampleDTO = sampleInquiryGetDTO();
        Mockito.when(inquiryService.getByUserId("user123"))
                .thenReturn(ResponseEntity.ok(List.of(sampleDTO)));

        mockMvc.perform(get("/inquiries/user/user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(sampleDTO.getId()))
                .andExpect(jsonPath("$[0].firstName").value(sampleDTO.getFirstName()));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByStatus_success() throws Exception {
        InquiryGetDTO sampleDTO = sampleInquiryGetDTO();
        sampleDTO.setStatus(InquiryStatus.ABIERTA);

        Mockito.when(inquiryService.getByStatus(InquiryStatus.ABIERTA))
                .thenReturn(ResponseEntity.ok(List.of(sampleDTO)));

        mockMvc.perform(get("/inquiries/getByStatus")
                        .param("status", "ABIERTA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(sampleDTO.getId()))
                .andExpect(jsonPath("$[0].status").value("ABIERTA"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getInquiriesPerMonth_success() throws Exception {
        Map<YearMonth, Long> stats = Map.of(YearMonth.of(2024, 5), 12L);
        Mockito.when(inquiryService.getInquiriesPerMonth())
                .thenReturn(ResponseEntity.ok(stats));

        mockMvc.perform(get("/inquiries/statistics/month"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['2024-05']").value(12));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getInquiryStatusDistribution_success() throws Exception {
        Map<String, Long> data = Map.of("ABIERTA", 5L, "CERRADA", 3L);
        Mockito.when(inquiryService.getInquiryStatusDistribution()).thenReturn(ResponseEntity.ok(data));

        mockMvc.perform(get("/inquiries/statistics/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ABIERTA").value(5))
                .andExpect(jsonPath("$.CERRADA").value(3));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getInquiriesGroupedByDayOfWeek_success() throws Exception {
        Map<String, Long> data = Map.of("MONDAY", 4L, "TUESDAY", 2L);
        Mockito.when(inquiryService.getInquiriesGroupedByDayOfWeek()).thenReturn(ResponseEntity.ok(data));

        mockMvc.perform(get("/inquiries/statistics/week"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.MONDAY").value(4));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getInquiriesGroupedByTimeRange_success() throws Exception {
        Map<String, Long> data = Map.of("08:00-12:00", 10L);
        Mockito.when(inquiryService.getInquiriesGroupedByTimeRange()).thenReturn(ResponseEntity.ok(data));

        mockMvc.perform(get("/inquiries/statistics/time"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['08:00-12:00']").value(10));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getMostConsultedProperties_success() throws Exception {
        Map<String, Long> data = Map.of("Casa en Córdoba", 7L);
        Mockito.when(inquiryService.getMostConsultedProperties()).thenReturn(ResponseEntity.ok(data));

        mockMvc.perform(get("/inquiries/statistics/properties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['Casa en Córdoba']").value(7));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAverageInquiryResponseTime_success() throws Exception {
        Mockito.when(inquiryService.getAverageInquiryResponseTime())
                .thenReturn(ResponseEntity.ok("3 días promedio"));

        mockMvc.perform(get("/inquiries/statistics/duration"))
                .andExpect(status().isOk())
                .andExpect(content().string("3 días promedio"));
    }

    // casos de error

    @Test
    void updateStatus_unauthorized() throws Exception {
        mockMvc.perform(put("/inquiries/status/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getById_unauthorized() throws Exception {
        mockMvc.perform(get("/inquiries/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getByStatus_unauthorized() throws Exception {
        mockMvc.perform(get("/inquiries/getByStatus")
                        .param("status", "ABIERTA"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getInquiriesPerMonth_unauthorized() throws Exception {
        mockMvc.perform(get("/inquiries/statistics/month"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void getInquiriesGroupedByDayOfWeek_internalServerError() throws Exception {
        Mockito.when(inquiryService.getInquiriesGroupedByDayOfWeek())
                .thenReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());

        mockMvc.perform(get("/inquiries/statistics/week"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "user")
    void createInquiry_internalServerError() throws Exception {
        Mockito.when(inquiryService.create(any()))
                .thenReturn(ResponseEntity.internalServerError().build());

        mockMvc.perform(post("/inquiries/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(sampleDTO)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_notFound() throws Exception {
        Mockito.when(inquiryService.getById(999L))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/inquiries/getById/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getMostConsultedProperties_unauthorized() throws Exception {
        mockMvc.perform(get("/inquiries/statistics/properties"))
                .andExpect(status().isUnauthorized());
    }

}
