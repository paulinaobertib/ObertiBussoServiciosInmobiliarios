package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.SurveyController;
import pi.ms_properties.dto.SurveyDTO;
import pi.ms_properties.service.interf.ISurveyService;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SurveyController.class)
@RequiredArgsConstructor
public class SurveyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private ISurveyService surveyService;

    @Autowired
    private ObjectMapper objectMapper;

    private SurveyDTO sampleSurvey;

    @BeforeEach
    void setUp() {
        sampleSurvey = new SurveyDTO(1L, 5, "Muy bueno", 10L);
    }

    // casos de exito

    @Test
    void testCreateSurveySuccess() throws Exception {
        Mockito.when(surveyService.create(any())).thenReturn(ResponseEntity.status(201).body("Created"));

        mockMvc.perform(post("/survey/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleSurvey)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetSurveyByIdAsAdmin() throws Exception {
        Mockito.when(surveyService.getById(1L)).thenReturn(ResponseEntity.ok(sampleSurvey));

        mockMvc.perform(get("/survey/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(5))
                .andExpect(jsonPath("$.comment").value("Muy bueno"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetAllSurveysAsAdmin() throws Exception {
        Mockito.when(surveyService.getAll()).thenReturn(ResponseEntity.ok(List.of(sampleSurvey)));

        mockMvc.perform(get("/survey/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetAverageScore() throws Exception {
        Mockito.when(surveyService.getAverageScore()).thenReturn(ResponseEntity.ok(4.5f));

        mockMvc.perform(get("/survey/average"))
                .andExpect(status().isOk())
                .andExpect(content().string("4.5"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetScoreDistribution() throws Exception {
        Mockito.when(surveyService.getScoreDistribution()).thenReturn(ResponseEntity.ok(Map.of(5, 3L)));

        mockMvc.perform(get("/survey/distribution"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$['5']").value(3));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetDailyAverageScore() throws Exception {
        Mockito.when(surveyService.getDailyAverageScore()).thenReturn(ResponseEntity.ok(Map.of("2024-05-20", 4.2)));

        mockMvc.perform(get("/survey/daily-average"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['2024-05-20']").value(4.2));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetMonthlyAverageScore() throws Exception {
        Mockito.when(surveyService.getMonthlyAverageScore())
                .thenReturn(ResponseEntity.ok(Map.of(YearMonth.of(2024, 5), 4.7)));

        mockMvc.perform(get("/survey/monthly-average"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.['2024-05']").value(4.7));
    }

    // casos de error

    @Test
    void testGetSurveyByIdWithoutAuth_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/survey/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetAllSurveysWithoutAuth_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/survey/all"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetAverageScoreWithoutAuth_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/survey/average"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetDistributionWithoutAuth_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/survey/distribution"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetDailyAverageWithoutAuth_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/survey/daily-average"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetMonthlyAverageWithoutAuth_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/survey/monthly-average"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void testSurveyNotFound_shouldReturn404() throws Exception {
        Mockito.when(surveyService.getById(eq(99L)))
                .thenReturn(ResponseEntity.status(404).build());

        mockMvc.perform(get("/survey/99"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Survey not found"));
    }

    @Test
    void testCreateSurveyInvalidInput_shouldReturn400() throws Exception {
        SurveyDTO invalidSurvey = new SurveyDTO(null, 7, "", null); // datos inválidos

        mockMvc.perform(post("/survey/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidSurvey)))
                .andExpect(status().isBadRequest());
    }
}

