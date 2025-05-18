package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Survey;
import pi.ms_properties.dto.SurveyDTO;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;


public interface ISurveyService {
    ResponseEntity<String> sendSurvey(String emailTo, Long inquiryId);

    ResponseEntity<String> create(SurveyDTO surveyDTO);

    ResponseEntity<SurveyDTO> getById(Long id);

    ResponseEntity<List<SurveyDTO>> getAll();

    ResponseEntity<Float> getAverageScore();

    ResponseEntity<Map<Integer, Long>> getScoreDistribution();

    ResponseEntity<Map<String, Double>> getDailyAverageScore();

    ResponseEntity<Map<YearMonth, Double>> getMonthlyAverageScore();
}
