package pi.ms_users.service.interf;

import jakarta.mail.MessagingException;
import pi.ms_users.dto.*;

import java.time.LocalDateTime;

public interface IEmailService {
    void sendAppointmentRequest(EmailDTO emailDTO) throws MessagingException;

    void sendAppointmentDecisionToClient(String clientEmail, boolean accepted, String firstName, LocalDateTime date, String address);

    void sendAppointmentCancelledMail(EmailDTO emailDTO);

    void sendNotificationNewProperty(EmailPropertyDTO emailPropertyDTO);

    void sendNotificationNewInterestProperty(EmailPropertyDTO emailPropertyDTO);

    void sendNewUserCredentialsEmail(EmailNewUserDTO emailData);

    void sendNewContractEmail(EmailContractDTO emailData);

    void sendContractIncreaseEmail(EmailContractIncreaseDTO emailData);
}
