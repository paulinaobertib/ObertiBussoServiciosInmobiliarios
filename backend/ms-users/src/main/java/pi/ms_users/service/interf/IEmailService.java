package pi.ms_users.service.interf;

import jakarta.mail.MessagingException;
import pi.ms_users.dto.EmailDTO;
import pi.ms_users.dto.EmailPropertyDTO;

import java.time.LocalDateTime;

public interface IEmailService {
    void sendAppointmentRequest(EmailDTO emailDTO) throws MessagingException;

    void sendAppointmentDecisionToClient(String clientEmail, boolean accepted, String firstName, LocalDateTime date);

    void sendAppointmentCancelledMail(EmailDTO emailDTO);

    void sendNotificationNewProperty(EmailPropertyDTO emailPropertyDTO);
}
