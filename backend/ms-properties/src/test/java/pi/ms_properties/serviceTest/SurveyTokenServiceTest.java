package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.SurveyToken;
import pi.ms_properties.repository.ISurveyTokenRepository;
import pi.ms_properties.service.impl.SurveyTokenService;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SurveyTokenServiceTest {

    @InjectMocks
    private SurveyTokenService surveyTokenService;

    @Mock
    private ISurveyTokenRepository surveyTokenRepository;

    @Mock
    private Inquiry mockInquiry;

    // casos de exito

    @Test
    void testCreate_Success() {
        ArgumentCaptor<SurveyToken> captor = ArgumentCaptor.forClass(SurveyToken.class);

        String token = surveyTokenService.create(mockInquiry);

        verify(surveyTokenRepository).save(captor.capture());
        SurveyToken savedToken = captor.getValue();

        assertNotNull(savedToken.getToken());
        assertFalse(savedToken.isUsed());
        assertEquals(mockInquiry, savedToken.getInquiry());
        assertTrue(savedToken.getExpiration().isAfter(LocalDateTime.now()));
        assertEquals(savedToken.getToken(), token);
    }

    @Test
    void testFindByToken_Success() {
        SurveyToken mockToken = new SurveyToken();
        mockToken.setToken("abc123");
        when(surveyTokenRepository.findByToken("abc123")).thenReturn(mockToken);

        SurveyToken result = surveyTokenService.findByToken("abc123");

        assertNotNull(result);
        assertEquals("abc123", result.getToken());
    }

    @Test
    void testMarkAsUsed_Success() {
        SurveyToken token = new SurveyToken();
        token.setUsed(false);

        surveyTokenService.markAsUsed(token);

        assertTrue(token.isUsed());
        verify(surveyTokenRepository).save(token);
    }

    @Test
    void testIsTokenValid_Success() {
        SurveyToken token = new SurveyToken();
        token.setUsed(false);
        token.setExpiration(LocalDateTime.now().plusDays(1));
        when(surveyTokenRepository.findByToken("valid-token")).thenReturn(token);

        boolean result = surveyTokenService.isTokenValid("valid-token");

        assertTrue(result);
    }

    // casos de error

    @Test
    void testCreate_RepositoryFails() {
        doThrow(new RuntimeException("DB error")).when(surveyTokenRepository).save(any(SurveyToken.class));
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                surveyTokenService.create(mockInquiry)
        );
        assertEquals("DB error", exception.getMessage());
    }

    @Test
    void testFindByToken_NotFound() {
        when(surveyTokenRepository.findByToken("not-found")).thenReturn(null);

        SurveyToken result = surveyTokenService.findByToken("not-found");

        assertNull(result);
    }

    @Test
    void testMarkAsUsed_RepositoryFails() {
        SurveyToken token = new SurveyToken();
        doThrow(new RuntimeException("Save failed")).when(surveyTokenRepository).save(any());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                surveyTokenService.markAsUsed(token)
        );

        assertEquals("Save failed", exception.getMessage());
    }

    @Test
    void testIsTokenValid_TokenUsed() {
        SurveyToken token = new SurveyToken();
        token.setUsed(true);
        token.setExpiration(LocalDateTime.now().plusDays(1));
        when(surveyTokenRepository.findByToken("used-token")).thenReturn(token);

        boolean result = surveyTokenService.isTokenValid("used-token");

        assertFalse(result);
    }

    @Test
    void testIsTokenValid_TokenExpired() {
        SurveyToken token = new SurveyToken();
        token.setUsed(false);
        token.setExpiration(LocalDateTime.now().minusDays(1));
        when(surveyTokenRepository.findByToken("expired-token")).thenReturn(token);

        boolean result = surveyTokenService.isTokenValid("expired-token");

        assertFalse(result);
    }

    @Test
    void testIsTokenValid_TokenNull() {
        when(surveyTokenRepository.findByToken("null-token")).thenReturn(null);

        boolean result = surveyTokenService.isTokenValid("null-token");

        assertFalse(result);
    }

    @Test
    void testIsTokenValid_ExpirationNull() {
        SurveyToken token = new SurveyToken();
        token.setUsed(false);
        token.setExpiration(null);
        when(surveyTokenRepository.findByToken("no-expiration")).thenReturn(token);

        boolean result = surveyTokenService.isTokenValid("no-expiration");

        assertFalse(result);
    }
}
