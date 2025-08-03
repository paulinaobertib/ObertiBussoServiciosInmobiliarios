package pi.ms_properties.service.interf;

import jakarta.mail.MessagingException;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.dto.SurveyDTO;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;


public interface ISurveyService {
    ResponseEntity<String> sendSurvey(String emailTo, Long inquiryId, String token) throws MessagingException;

    ResponseEntity<String> create(SurveyDTO surveyDTO, String token);

    ResponseEntity<SurveyDTO> getById(Long id);

    ResponseEntity<List<SurveyDTO>> getAll();

    ResponseEntity<Float> getAverageScore();

    ResponseEntity<Map<Integer, Long>> getScoreDistribution();

    ResponseEntity<Map<String, Double>> getDailyAverageScore();

    ResponseEntity<Map<YearMonth, Double>> getMonthlyAverageScore();
}
