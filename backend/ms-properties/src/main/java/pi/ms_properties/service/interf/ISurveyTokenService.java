package pi.ms_properties.service.interf;

import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.SurveyToken;

public interface ISurveyTokenService {
    String create(Inquiry inquiry);
    SurveyToken findByToken(String token);
    void markAsUsed(SurveyToken surveyToken);
    boolean isTokenValid(String token);
}