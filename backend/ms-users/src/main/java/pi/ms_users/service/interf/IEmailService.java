package pi.ms_users.service.interf;

import pi.ms_users.dto.email.*;

import java.time.LocalDateTime;

public interface IEmailService {
    void sendAppointmentRequest(EmailDTO emailDTO);

    void sendAppointmentDecisionToClient(Long appointmentId, String clientEmail, boolean accepted, String firstName, LocalDateTime date, String address);

    void sendApologyForCancelledAppointment(Long appointmentId, String clientEmail, String firstName, LocalDateTime date);

    void sendAppointmentCancelledMail(EmailDTO emailDTO);

    void sendNotificationNewProperty(EmailPropertyDTO emailPropertyDTO);

    void sendNotificationNewInterestProperty(EmailPropertyDTO emailPropertyDTO);

    void sendNewUserCredentialsEmail(EmailNewUserDTO emailData);

    void sendNewContractEmail(EmailNewContractDTO dto, Long contractId);

    void sendContractExpiredEmail(EmailExpiredContractDTO dto);

    void sendContractExpiringSoonEmail(EmailContractExpiringSoonDTO dto, Long contractId);

    void sendContractUpcomingIncreaseOneMonthEmail(EmailContractUpcomingIncreaseOneMonthDTO dto, Long contractId);

    void sendContractIncreaseLoadedEmail(EmailContractIncreaseLoadedDTO dto, Long contractId);

    void sendContractIncreaseLoadedEmailUpdate(EmailContractIncreaseLoadedDTO dto, Long contractId);

    void sendContractPaymentReminderEmail(EmailContractPaymentReminderDTO dto, Long contractId);

    void sendUtilityPaymentReminderEmail(EmailUtilityPaymentReminderDTO dto, Long contractId);

    void sendUtilityAmountLoadedEmail(EmailUtilityAmountLoadedDTO dto, Long contractId);

    void sendUtilityAmountLoadedEmailUpdate(EmailUtilityAmountLoadedDTO dto, Long contractId);

    void sendAdminContractUpcomingIncreaseListEmail(EmailContractIncreaseAdminDTO dto);

    void sendAdminUtilityUpcomingChargeListEmail(EmailExtraAdminDTO dto);

    void sendAdminContractsExpiringSoonListEmail(EmailContractExpiringSoonListAdminDTO dto);

    void sendAdminContractExpiredEmail(EmailContractExpiredAdminDTO dto);
}