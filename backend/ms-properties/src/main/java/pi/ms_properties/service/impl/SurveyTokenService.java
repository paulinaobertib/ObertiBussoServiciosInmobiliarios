package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.SurveyToken;
import pi.ms_properties.repository.ISurveyTokenRepository;
import pi.ms_properties.service.interf.ISurveyTokenService;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SurveyTokenService implements ISurveyTokenService {

    private final ISurveyTokenRepository surveyTokenRepository;

    @Override
    public String create(Inquiry inquiry) {
        SurveyToken surveyToken = new SurveyToken();
        surveyToken.setUsed(false);
        surveyToken.setInquiry(inquiry);
        surveyToken.setExpiration(LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")).plusDays(5));
        surveyToken.setToken(UUID.randomUUID().toString());
        surveyTokenRepository.save(surveyToken);
        return surveyToken.getToken();
    }

    @Override
    public SurveyToken findByToken(String token) {
        return surveyTokenRepository.findByToken(token);
    }

    @Override
    public void markAsUsed(SurveyToken surveyToken) {
        surveyToken.setUsed(true);
        surveyTokenRepository.save(surveyToken);
    }

    @Override
    public boolean isTokenValid(String token) {
        SurveyToken surveyToken = surveyTokenRepository.findByToken(token);
        return surveyToken != null
                && !surveyToken.isUsed()
                && surveyToken.getExpiration() != null
                && !surveyToken.getExpiration().isBefore(LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")));
    }
}
