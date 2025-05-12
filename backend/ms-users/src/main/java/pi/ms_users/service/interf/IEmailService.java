package pi.ms_users.service.interf;

import jakarta.mail.MessagingException;
import pi.ms_users.dto.EmailDTO;

import java.time.LocalDateTime;

public interface IEmailService {
    public void sendAppointmentRequest(EmailDTO emailDTO) throws MessagingException;
    public void sendAppointmentDecisionToClient(String clientEmail, boolean accepted, String firstName, LocalDateTime date);
    public void sendAppointmentCancelledMail(EmailDTO emailDTO);
}
