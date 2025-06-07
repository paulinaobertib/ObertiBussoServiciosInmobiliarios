package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.Survey;
import pi.ms_properties.dto.SurveyDTO;
import pi.ms_properties.repository.IInquiryRepository;
import pi.ms_properties.repository.ISurveyRepository;
import pi.ms_properties.service.interf.IEmailService;
import pi.ms_properties.service.interf.ISurveyService;

import java.time.DayOfWeek;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyService implements ISurveyService {

    private final ISurveyRepository surveyRepository;

    private final IInquiryRepository inquiryRepository;

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
    public ResponseEntity<String> create(SurveyDTO surveyDTO) {
        try {
            Optional<Inquiry> inquiry = inquiryRepository.findById(surveyDTO.getInquiryId());
            if (inquiry.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado la consulta");
            }
            Survey survey = new Survey();
            survey.setComment(surveyDTO.getComment());
            survey.setScore(surveyDTO.getScore());
            survey.setInquiry(inquiry.get());
            surveyRepository.save(survey);
            return ResponseEntity.ok("Se ha guardado correctamente la encuesta");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<SurveyDTO> getById(Long id) {
        try {
            Optional<Survey> survey = surveyRepository.findById(id);
            if (survey.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Survey get = survey.get();
            SurveyDTO surveyDTO = new SurveyDTO(get.getId(), get.getScore(), get.getComment(), get.getInquiry().getId());
            return ResponseEntity.ok(surveyDTO);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<SurveyDTO>> getAll() {
        try {
            List<Survey> surveys = surveyRepository.findAll();
            List<SurveyDTO> surveyDTOS = surveys
                    .stream()
                    .map(survey -> new SurveyDTO(
                            survey.getId(),
                            survey.getScore(),
                            survey.getComment(),
                            survey.getInquiry().getId()
                    ))
                    .toList();
            return ResponseEntity.ok(surveyDTOS);
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
    public ResponseEntity<Map<String, Double>> getDailyAverageScore() {
        List<Object[]> data = surveyRepository.findAverageScoreGroupedByDayOfWeek();

        Map<String, Double> result = data.stream()
                .collect(Collectors.toMap(
                        row -> {
                            int dayNumber = ((Number) row[0]).intValue();
                            DayOfWeek dayOfWeek = DayOfWeek.of(dayNumber == 1 ? 7 : dayNumber - 1);
                            return dayOfWeek.getDisplayName(TextStyle.FULL, new Locale("es", "ES"));
                        },
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
