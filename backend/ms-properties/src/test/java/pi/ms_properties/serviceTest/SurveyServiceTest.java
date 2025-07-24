package pi.ms_properties.serviceTest;

import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.Survey;
import pi.ms_properties.dto.SurveyDTO;
import pi.ms_properties.repository.IInquiryRepository;
import pi.ms_properties.repository.ISurveyRepository;
import pi.ms_properties.service.impl.SurveyService;
import pi.ms_properties.service.interf.IEmailService;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SurveyServiceTest {

    @InjectMocks
    private SurveyService surveyService;

    @Mock
    private ISurveyRepository surveyRepository;

    @Mock
    private IInquiryRepository inquiryRepository;

    @Mock
    private IEmailService emailService;

    // casos de exito

    @Test
    void sendSurvey_success() throws MessagingException {
        doNothing().when(emailService).sendEmailSurvey(anyString(), anyLong());

        ResponseEntity<String> response = surveyService.sendSurvey("test@example.com", 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha enviado la encuesta", response.getBody());
    }

    @Test
    void create_success() {
        Inquiry inquiry = new Inquiry();
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));

        SurveyDTO dto = new SurveyDTO(null, 5, "Muy buena atención", 1L);

        ResponseEntity<String> response = surveyService.create(dto);

        verify(surveyRepository).save(any(Survey.class));
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha guardado correctamente la encuesta", response.getBody());
    }

    @Test
    void getById_success() {
        Survey survey = new Survey();
        survey.setId(1L);
        survey.setScore(4);
        survey.setComment("Buena");
        survey.setInquiry(new Inquiry());
        survey.getInquiry().setId(2L);

        when(surveyRepository.findById(1L)).thenReturn(Optional.of(survey));

        ResponseEntity<SurveyDTO> response = surveyService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1L, response.getBody().getId());
        assertEquals(4, response.getBody().getScore());
    }

    @Test
    void getAll_success() {
        Survey s1 = new Survey(1L, 5, "Excelente", new Inquiry());
        s1.getInquiry().setId(1L);

        when(surveyRepository.findAll()).thenReturn(List.of(s1));

        ResponseEntity<List<SurveyDTO>> response = surveyService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getAverageScore_success() {
        when(surveyRepository.findAverageScore()).thenReturn(4.5f);

        ResponseEntity<Float> response = surveyService.getAverageScore();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(4.5f, response.getBody());
    }

    @Test
    void getScoreDistribution_success() {
        Object[] entry = new Object[]{5, 10L};
        List<Object[]> mockResult = new ArrayList<>();
        mockResult.add(entry);
        when(surveyRepository.countScores()).thenReturn(mockResult);

        ResponseEntity<Map<Integer, Long>> response = surveyService.getScoreDistribution();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().containsKey(5));
        assertEquals(10L, response.getBody().get(5));
    }

    @Test
    void getDailyAverageScore_success() {
        Object[] entry = new Object[]{2, 4.0};
        List<Object[]> mockResult = new ArrayList<>();
        mockResult.add(entry);
        when(surveyRepository.findAverageScoreGroupedByDayOfWeek()).thenReturn(mockResult);

        ResponseEntity<Map<String, Double>> response = surveyService.getDailyAverageScore();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().containsKey("lunes"));
        assertEquals(4.0, response.getBody().get("lunes"));
    }

    @Test
    void getMonthlyAverageScore_success() {
        Object[] entry = new Object[]{"2024-05", 4.2};
        List<Object[]> mockResult = new ArrayList<>();
        mockResult.add(entry);
        when(surveyRepository.findMonthlyAverageScore()).thenReturn(mockResult);

        ResponseEntity<Map<YearMonth, Double>> response = surveyService.getMonthlyAverageScore();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(4.2, response.getBody().get(YearMonth.of(2024, 5)));
    }

    // casos de error

    @Test
    void sendSurvey_internalServerError() throws MessagingException {
        doThrow(RuntimeException.class).when(emailService).sendEmailSurvey(anyString(), anyLong());

        assertThrows(RuntimeException.class, () ->
            surveyService.sendSurvey("fail@example.com", 1L));
    }

    @Test
    void create_inquiryNotFound() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.empty());

        SurveyDTO dto = new SurveyDTO(null, 3, "Normal", 1L);

        assertThrows(EntityNotFoundException.class, () ->
            surveyService.create(dto));
    }

    @Test
    void create_dataIntegrityViolation() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(new Inquiry()));
        doThrow(DataIntegrityViolationException.class).when(surveyRepository).save(any(Survey.class));

        SurveyDTO dto = new SurveyDTO(null, 3, "Normal", 1L);

        assertThrows(DataIntegrityViolationException.class, () ->
            surveyService.create(dto));
    }

    @Test
    void getById_notFound() {
        when(surveyRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
            surveyService.getById(1L));
    }

    @Test
    void getAll_internalServerError() {
        when(surveyRepository.findAll()).thenThrow(RuntimeException.class);

        assertThrows(RuntimeException.class, () ->
            surveyService.getAll());
    }

    @Test
    void sendSurvey_shouldThrowDataIntegrityViolationException() throws MessagingException {
        doThrow(new DataIntegrityViolationException("Violation"))
                .when(emailService).sendEmailSurvey(anyString(), anyLong());

        assertThrows(DataIntegrityViolationException.class, () ->
            surveyService.sendSurvey("test@email.com", 1L));
    }

    @Test
    void create_shouldThrowDataIntegrityViolationException() {
        SurveyDTO surveyDTO = new SurveyDTO(null, 5, "Comentario", 1L);
        Inquiry inquiry = new Inquiry();
        inquiry.setId(1L);

        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));
        doThrow(new DataIntegrityViolationException("Violation"))
                .when(surveyRepository).save(any(Survey.class));

        assertThrows(DataIntegrityViolationException.class, () ->
            surveyService.create(surveyDTO));
    }

    @Test
    void getById_shouldThrowDataIntegrityViolationException() {
        when(surveyRepository.findById(1L))
                .thenThrow(new DataIntegrityViolationException("Violation"));

        assertThrows(DataIntegrityViolationException.class, () ->
            surveyService.getById(1L));
    }

    @Test
    void getAll_shouldThrowDataIntegrityViolationException() {
        when(surveyRepository.findAll())
                .thenThrow(new DataIntegrityViolationException("Violation"));

        assertThrows(DataIntegrityViolationException.class, () ->
            surveyService.getAll());
    }

    @Test
    void create_scoreTooLow_returnsBadRequest() {
        Inquiry inquiry = new Inquiry();
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));

        SurveyDTO dto = new SurveyDTO(null, 0, "Muy mala atención", 1L);

        ResponseEntity<String> response = surveyService.create(dto);

        verify(surveyRepository, never()).save(any());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("El score no puede ser menor a 1 ni mayor a 5.", response.getBody());
    }

    @Test
    void create_scoreTooHigh_returnsBadRequest() {
        Inquiry inquiry = new Inquiry();
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));

        SurveyDTO dto = new SurveyDTO(null, 6, "Excelente atención", 1L);

        ResponseEntity<String> response = surveyService.create(dto);

        verify(surveyRepository, never()).save(any());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("El score no puede ser menor a 1 ni mayor a 5.", response.getBody());
    }

    @Test
    void create_alreadyExists() {
        Inquiry inquiry = new Inquiry();
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));
        when(surveyRepository.countSurveysByInquiryId(1L)).thenReturn(1L);

        SurveyDTO dto = new SurveyDTO(null, 5, "Todo bien", 1L);

        ResponseEntity<String> response = surveyService.create(dto);

        verify(surveyRepository, never()).save(any());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Ya existe una encuesta para esta consulta.", response.getBody());
    }
}
