package pi.ms_properties.service.interf;

import jakarta.mail.MessagingException;
import pi.ms_properties.dto.EmailDTO;

public interface IEmailService {

    void sendEmailInquiry(EmailDTO emailDTO) throws MessagingException;

    void sendEmailSurvey(String emailTO, Long inquiryId) throws MessagingException;
}
