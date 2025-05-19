package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Survey;
import pi.ms_properties.dto.SurveyDTO;
import pi.ms_properties.service.interf.ISurveyService;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/survey")
@RequiredArgsConstructor
public class SurveyController {

    private final ISurveyService surveyService;

    @PostMapping("/create")
    public ResponseEntity<String> createSurvey(@RequestBody SurveyDTO surveyDTO) {
        return surveyService.create(surveyDTO);
    }

    // @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<SurveyDTO> getSurveyById(@PathVariable Long id) {
        return surveyService.getById(id);
    }

    // @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<SurveyDTO>> getAllSurveys() {
        return surveyService.getAll();
    }

    // @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/averageScore")
    public ResponseEntity<Float> getAverageScore() {
        return surveyService.getAverageScore();
    }

    // @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/score")
    public ResponseEntity<Map<Integer, Long>> getScoreDistribution() {
        return surveyService.getScoreDistribution();
    }

    // @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/daily")
    public ResponseEntity<Map<String, Double>> getDailyAverageScore() {
        return surveyService.getDailyAverageScore();
    }

    // @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/monthly")
    public ResponseEntity<Map<YearMonth, Double>> getMonthlyAverageScore() {
        return surveyService.getMonthlyAverageScore();
    }
}

