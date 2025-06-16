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
import pi.ms_properties.controller.SurveyController;
import pi.ms_properties.dto.SurveyDTO;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.interf.ISurveyService;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(SurveyController.class)
@Import({SurveyControllerTest.Config.class, WebSecurityConfig.class})
class SurveyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ISurveyService surveyService;

    @Autowired
    private ObjectMapper objectMapper;

    private SurveyDTO sampleSurvey;

    @TestConfiguration
    static class Config {
        @Bean
        public ISurveyService surveyService() {
            return Mockito.mock(ISurveyService.class);
        }
    }

    @BeforeEach
    void setUp() {
        sampleSurvey = new SurveyDTO(1L, 5, "Muy bueno", 10L);
    }

    // casos de exito

    @Test
    void testCreateSurveySuccess() throws Exception {
        Mockito.when(surveyService.create(any())).thenReturn(ResponseEntity.ok("Se ha guardado correctamente la encuesta"));

        mockMvc.perform(post("/survey/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleSurvey)))
                .andExpect(status().isOk())
                .andExpect(content().string("Se ha guardado correctamente la encuesta"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetSurveyByIdAsAdmin() throws Exception {
        Mockito.when(surveyService.getById(1L)).thenReturn(ResponseEntity.ok(sampleSurvey));

        mockMvc.perform(get("/survey/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(5))
                .andExpect(jsonPath("$.comment").value("Muy bueno"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetAllSurveysAsAdmin() throws Exception {
        Mockito.when(surveyService.getAll()).thenReturn(ResponseEntity.ok(List.of(sampleSurvey)));

        mockMvc.perform(get("/survey/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetAverageScore() throws Exception {
        Mockito.when(surveyService.getAverageScore()).thenReturn(ResponseEntity.ok(4.5f));

        mockMvc.perform(get("/survey/statistics/averageScore"))
                .andExpect(status().isOk())
                .andExpect(content().string("4.5"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetScoreDistribution() throws Exception {
        Mockito.when(surveyService.getScoreDistribution()).thenReturn(ResponseEntity.ok(Map.of(5, 3L)));

        mockMvc.perform(get("/survey/statistics/score"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['5']").value(3));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetDailyAverageScore() throws Exception {
        Mockito.when(surveyService.getDailyAverageScore()).thenReturn(ResponseEntity.ok(Map.of("lunes", 4.2)));

        mockMvc.perform(get("/survey/statistics/daily"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['lunes']").value(4.2));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetMonthlyAverageScore() throws Exception {
        Mockito.when(surveyService.getMonthlyAverageScore())
                .thenReturn(ResponseEntity.ok(Map.of(YearMonth.of(2024, 5), 4.7)));

        mockMvc.perform(get("/survey/statistics/monthly"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['2024-05']").value(4.7));
    }

    // casos de error

    @Test
    void testGetSurveyByIdWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/survey/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetAllSurveysWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/survey/getAll"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetAverageScoreWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/survey/statistics/averageScore"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetDistributionWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/survey/statistics/score"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetDailyAverageWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/survey/statistics/daily"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetMonthlyAverageWithoutAuth_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/survey/statistics/monthly"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void testSurveyNotFound_shouldReturn404() throws Exception {
        Mockito.when(surveyService.getById(eq(99L)))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        mockMvc.perform(get("/survey/getById/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateSurveyInvalidInput_shouldReturn400() throws Exception {
        SurveyDTO invalidSurvey = new SurveyDTO(null, 7, "", null);

        Mockito.when(surveyService.create(any())).thenReturn(ResponseEntity.badRequest().build());

        mockMvc.perform(post("/survey/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidSurvey)))
                .andExpect(status().isBadRequest());
    }
}
