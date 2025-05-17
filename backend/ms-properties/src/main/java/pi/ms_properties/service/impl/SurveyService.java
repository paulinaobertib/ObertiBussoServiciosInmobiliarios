package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Survey;
import pi.ms_properties.repository.ISurveyRepository;
import pi.ms_properties.service.interf.IEmailService;
import pi.ms_properties.service.interf.ISurveyService;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyService implements ISurveyService {

    private final ISurveyRepository surveyRepository;

    private final IEmailService emailService;

    @Override
    public ResponseEntity<String> sendSurvey(String emailTo, Long inquiryId) {
        try {
            emailService.sendEmailSurvey(emailTo, inquiryId);
            return ResponseEntity.ok("Se ha enviado la encuesta");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> create(Survey survey) {
        try {
           surveyRepository.save(survey);
            return ResponseEntity.ok("Se ha guardado correctamente la encuesta");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Survey> getById(Long id) {
        try {
            Optional<Survey> survey = surveyRepository.findById(id);
            return survey.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Survey>> getAll() {
        try {
            List<Survey> surveys = surveyRepository.findAll();
            return ResponseEntity.ok(surveys);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Float> getAverageScore() {
        Float avg = surveyRepository.findAverageScore();
        return ResponseEntity.ok(avg != null ? avg : 0f);
    }

    @Override
    public ResponseEntity<Map<Integer, Long>> getScoreDistribution() {
        List<Object[]> data = surveyRepository.countScores();
        Map<Integer, Long> result = data.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (Long) row[1]
                ));
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<LocalDate, Double>> getDailyAverageScore() {
        List<Object[]> data = surveyRepository.findDailyAverageScore();
        Map<LocalDate, Double> result = data.stream()
                .collect(Collectors.toMap(
                        row -> ((LocalDate) row[0]),
                        row -> (Double) row[1]
                ));
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<YearMonth, Double>> getMonthlyAverageScore() {
        List<Object[]> data = surveyRepository.findMonthlyAverageScore();
        Map<YearMonth, Double> result = data.stream()
                .collect(Collectors.toMap(
                        row -> YearMonth.parse((String) row[0]),
                        row -> (Double) row[1]
                ));
        return ResponseEntity.ok(result);
    }
}
