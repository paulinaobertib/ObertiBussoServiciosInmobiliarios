package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Survey;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

public interface ISurveyService {
    ResponseEntity<String> sendSurvey(String emailTo, Long inquiryId);

    ResponseEntity<String> create(Survey survey);

    ResponseEntity<Survey> getById(Long id);

    ResponseEntity<List<Survey>> getAll();

    ResponseEntity<Float> getAverageScore();

    ResponseEntity<Map<Integer, Long>> getScoreDistribution();

    ResponseEntity<Map<LocalDate, Double>> getDailyAverageScore();

    ResponseEntity<Map<YearMonth, Double>> getMonthlyAverageScore();
}
