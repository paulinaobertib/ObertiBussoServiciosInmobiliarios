package pi.ms_users.serviceTest;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import pi.ms_users.configuration.components.AppProperties;
import pi.ms_users.dto.email.*;
import pi.ms_users.service.impl.EmailService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @InjectMocks
    private EmailService emailService;

    @Mock
    private JavaMailSender javaMailSender;

    @Mock
    private AppProperties appProperties;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private MimeMessage mimeMessage;

    private EmailDTO emailDTO;
    private EmailPropertyDTO emailPropertyDTO;

    @BeforeEach
    void setUp() {
        emailDTO = new EmailDTO();
        emailDTO.setTo("cliente@mail.com");
        emailDTO.setFirstName("Juan");
        emailDTO.setLastName("Pérez");
        emailDTO.setPhone("123456789");
        emailDTO.setDescription("Gracias por solicitar un turno.");
        emailDTO.setDate(LocalDateTime.of(2025, 6, 15, 10, 0));

        emailPropertyDTO = new EmailPropertyDTO();
        emailPropertyDTO.setTo("cliente@mail.com");
        emailPropertyDTO.setDate(LocalDateTime.of(2025, 6, 15, 10, 0));
        emailPropertyDTO.setPropertyImageUrl("https://img.com/1.jpg");
        emailPropertyDTO.setPropertyTitle("Casa en venta");
        emailPropertyDTO.setPropertyLocation("Córdoba");
        emailPropertyDTO.setPropertyPrice("100000");
        emailPropertyDTO.setPropertyDescription("Hermosa casa.");
        emailPropertyDTO.setPropertyCurrency("USD");
        emailPropertyDTO.setPropertyOperation("VENTA");
    }

    // casos de exito

    @Test
    void sendAppointmentRequest_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_inmobiliaria"), any(Context.class))).thenReturn("contenido-inmobiliaria");
        when(templateEngine.process(eq("email_client"), any(Context.class))).thenReturn("contenido-cliente");
        when(appProperties.getEmailInmobiliaria()).thenReturn("inmobiliaria@mail.com");

        emailService.sendAppointmentRequest(emailDTO);

        verify(javaMailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    void sendAppointmentDecisionToClient_accepted_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_accepted"), any(Context.class))).thenReturn("contenido");

        emailService.sendAppointmentDecisionToClient(1L, "cliente@mail.com", true, "Juan", LocalDateTime.now(), "Calle");

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAppointmentDecisionToClient_rejected_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_declined"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendAppointmentDecisionToClient(1L, "cliente@mail.com", false, "Juan", LocalDateTime.now(), "Calle");

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendApologyForCancelledAppointment_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_apology_cancelled"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendApologyForCancelledAppointment(1L, "cliente@mail.com", "Juan", LocalDateTime.now());

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAppointmentCancelledMail_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_canceled"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getEmailInmobiliaria()).thenReturn("inmobiliaria@mail.com");

        emailService.sendAppointmentCancelledMail(emailDTO);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNotificationNewProperty_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_new_property.html"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendNotificationNewProperty(emailPropertyDTO);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNotificationNewInterestProperty_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_new_interest_property.html"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendNotificationNewInterestProperty(emailPropertyDTO);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNewUserCredentialsEmail_success() {
        EmailNewUserDTO dto = new EmailNewUserDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setUserName("juan123");
        dto.setPassword("pass123");
        dto.setTitle("Credenciales");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_new_user"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendNewUserCredentialsEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNewContractEmail_success() {
        EmailNewContractDTO dto = new EmailNewContractDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setStartDate(LocalDate.of(2025, 6, 1));
        dto.setEndDate(LocalDate.of(2026, 6, 1));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_new_contract"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendNewContractEmail(dto, 1L);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractExpiredEmail_success() {
        EmailExpiredContractDTO dto = new EmailExpiredContractDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setEndDate(LocalDate.of(2025, 12, 31));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_expired_contract_user"), any(Context.class))).thenReturn("contenido");

        emailService.sendContractExpiredEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractExpiringSoonEmail_success() {
        EmailContractExpiringSoonDTO dto = new EmailContractExpiringSoonDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setEndDate(LocalDate.of(2025, 12, 31));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_expiring_soon_user"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendContractExpiringSoonEmail(dto, 1L);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractUpcomingIncreaseOneMonthEmail_success() {
        EmailContractUpcomingIncreaseOneMonthDTO dto = new EmailContractUpcomingIncreaseOneMonthDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setIndex("IPC");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_soon_month_increase"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendContractUpcomingIncreaseOneMonthEmail(dto, 1L);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractIncreaseLoadedEmail_success() {
        EmailContractIncreaseLoadedDTO dto = new EmailContractIncreaseLoadedDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setNewAmount(new BigDecimal("120000"));
        dto.setIncrease(10);
        dto.setIndex("IPC");
        dto.setCurrency("ARS");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_increased_user"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendContractIncreaseLoadedEmail(dto, 1L);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractPaymentReminderEmail_success() {
        EmailContractPaymentReminderDTO dto = new EmailContractPaymentReminderDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setDueDate(LocalDate.of(2025, 7, 2));
        dto.setAmount(new BigDecimal("15000"));
        dto.setCurrency("ARS");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_payment_reminder"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendContractPaymentReminderEmail(dto, 1L);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendUtilityPaymentReminderEmail_success() {
        EmailUtilityPaymentReminderDTO dto = new EmailUtilityPaymentReminderDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setUtilityName("Luz");
        dto.setPeriodicity("Mensual");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_extra_payment_reminder"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendUtilityPaymentReminderEmail(dto, 1L);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendUtilityAmountLoadedEmail_success() {
        EmailUtilityAmountLoadedDTO dto = new EmailUtilityAmountLoadedDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setUtilityName("Agua");
        dto.setAmount(new BigDecimal("5000"));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_extra_amount_loaded_user"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendUtilityAmountLoadedEmail(dto, 1L);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAdminContractUpcomingIncreaseListEmail_success() {
        EmailContractIncreaseAdminDTO dto = new EmailContractIncreaseAdminDTO();
        dto.setContracts(java.util.List.of(new ContractToIncreaseForAdminEmailDTO()));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_increase_admin"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(appProperties.getEmailInmobiliaria()).thenReturn("admin@mail.com");

        emailService.sendAdminContractUpcomingIncreaseListEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAdminUtilityUpcomingChargeListEmail_success() {
        EmailExtraAdminDTO dto = new EmailExtraAdminDTO();
        dto.setUtilities(java.util.List.of(new ExtrasForAdminEmailDTO()));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_extra_payment_admin"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(appProperties.getEmailInmobiliaria()).thenReturn("admin@mail.com");

        emailService.sendAdminUtilityUpcomingChargeListEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAdminContractsExpiringSoonListEmail_success() {
        EmailContractExpiringSoonListAdminDTO dto = new EmailContractExpiringSoonListAdminDTO();
        dto.setContracts(java.util.List.of(new ContractExpiringForAdminDTO()));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contracts_soon_expiring_admin"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(appProperties.getEmailInmobiliaria()).thenReturn("admin@mail.com");

        emailService.sendAdminContractsExpiringSoonListEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAdminContractExpiredEmail_success() {
        EmailContractExpiredAdminDTO dto = new EmailContractExpiredAdminDTO();
        dto.setPropertyId(1L);
        dto.setTenant("Juan Pérez");
        dto.setContractId(100L);

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_expired_admin"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(appProperties.getEmailInmobiliaria()).thenReturn("admin@mail.com");

        emailService.sendAdminContractExpiredEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractIncreaseLoadedEmailUpdate_success() {
        EmailContractIncreaseLoadedDTO dto = new EmailContractIncreaseLoadedDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setNewAmount(BigDecimal.TEN);
        dto.setIncrease(5);
        dto.setIndex("IPC");
        dto.setCurrency("USD");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_increased_user_update"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendContractIncreaseLoadedEmailUpdate(dto, 1L);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendUtilityAmountLoadedEmailUpdate_success() {
        EmailUtilityAmountLoadedDTO dto = new EmailUtilityAmountLoadedDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setUtilityName("Gas");
        dto.setAmount(BigDecimal.valueOf(3000));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_extra_amount_loaded_user_update"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendUtilityAmountLoadedEmailUpdate(dto, 1L);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAppointmentDecisionToClient_rejected_noAddress_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_declined"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendAppointmentDecisionToClient(1L, "cliente@mail.com", false, "Juan", LocalDateTime.now(), null);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void formatAmount_usdAndArs() {
        String usd = (String)
                org.springframework.test.util.ReflectionTestUtils.invokeMethod(emailService, "formatAmount", BigDecimal.valueOf(1000), "USD");
        String ars = (String)
                org.springframework.test.util.ReflectionTestUtils.invokeMethod(emailService, "formatAmount", BigDecimal.valueOf(2000), "ARS");

        assertTrue(usd.startsWith("USD"));
        assertTrue(ars.startsWith("ARS"));
    }

    // casos de error

    @Test
    void sendAppointmentRequest_fails() {
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Fallo interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendAppointmentRequest(emailDTO));

        assertTrue(ex.getMessage().contains("Error al enviar los correos de solicitud"));
    }

    @Test
    void sendAppointmentCancelledMail_fails() {
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Fallo interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendAppointmentCancelledMail(emailDTO));

        assertTrue(ex.getMessage().contains("Error al enviar correo de cancelación"));
    }

    @Test
    void sendNotificationNewProperty_fails() {
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendNotificationNewProperty(emailPropertyDTO));

        assertTrue(ex.getMessage().contains("Error al enviar correo de nueva propiedad"));
    }

    @Test
    void sendNotificationNewInterestProperty_fails() {
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendNotificationNewInterestProperty(emailPropertyDTO));

        assertTrue(ex.getMessage().contains("Error al enviar correo de nueva propiedad"));
    }

    @Test
    void sendNewContractEmail_fails() {
        EmailNewContractDTO dto = new EmailNewContractDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setStartDate(LocalDate.now());
        dto.setEndDate(LocalDate.now().plusYears(1));

        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendNewContractEmail(dto, 1L));

        assertTrue(ex.getMessage().contains("Error al enviar correo de nuevo contrato"));
    }

    @Test
    void sendContractExpiredEmail_fails() {
        EmailExpiredContractDTO dto = new EmailExpiredContractDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setEndDate(LocalDate.now());

        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendContractExpiredEmail(dto));

        assertTrue(ex.getMessage().contains("Error al enviar correo de contrato vencido"));
    }

    @Test
    void sendContractExpiringSoonEmail_fails() {
        EmailContractExpiringSoonDTO dto = new EmailContractExpiringSoonDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setEndDate(LocalDate.now());

        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendContractExpiringSoonEmail(dto, 1L));

        assertTrue(ex.getMessage().contains("Error al enviar correo de contrato por vencer"));
    }

    @Test
    void sendContractUpcomingIncreaseOneMonthEmail_fails() {
        EmailContractUpcomingIncreaseOneMonthDTO dto = new EmailContractUpcomingIncreaseOneMonthDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setIndex("IPC");

        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendContractUpcomingIncreaseOneMonthEmail(dto, 1L));

        assertTrue(ex.getMessage().contains("Error al enviar aviso de aumento próximo"));
    }

    @Test
    void sendContractIncreaseLoadedEmail_fails() {
        EmailContractIncreaseLoadedDTO dto = new EmailContractIncreaseLoadedDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setNewAmount(BigDecimal.TEN);
        dto.setIncrease(10);
        dto.setIndex("IPC");
        dto.setCurrency("ARS");

        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendContractIncreaseLoadedEmail(dto, 1L));

        assertTrue(ex.getMessage().contains("Error al enviar correo de aumento aplicado"));
    }

    @Test
    void sendContractPaymentReminderEmail_fails() {
        EmailContractPaymentReminderDTO dto = new EmailContractPaymentReminderDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setDueDate(LocalDate.now());
        dto.setAmount(BigDecimal.ONE);
        dto.setCurrency("ARS");

        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendContractPaymentReminderEmail(dto, 1L));

        assertTrue(ex.getMessage().contains("Error al enviar recordatorio de pago de alquiler"));
    }

    @Test
    void sendUtilityPaymentReminderEmail_fails() {
        EmailUtilityPaymentReminderDTO dto = new EmailUtilityPaymentReminderDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setUtilityName("Luz");
        dto.setPeriodicity("Mensual");

        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendUtilityPaymentReminderEmail(dto, 1L));

        assertTrue(ex.getMessage().contains("Error al enviar recordatorio de utility"));
    }

    @Test
    void sendUtilityAmountLoadedEmail_fails() {
        EmailUtilityAmountLoadedDTO dto = new EmailUtilityAmountLoadedDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setUtilityName("Agua");
        dto.setAmount(BigDecimal.ONE);

        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendUtilityAmountLoadedEmail(dto, 1L));

        assertTrue(ex.getMessage().contains("Error al enviar monto cargado de utility"));
    }

    @Test
    void sendAdminContractUpcomingIncreaseListEmail_fails() {
        EmailContractIncreaseAdminDTO dto = new EmailContractIncreaseAdminDTO();
        dto.setContracts(java.util.List.of(new ContractToIncreaseForAdminEmailDTO()));

        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendAdminContractUpcomingIncreaseListEmail(dto));

        assertTrue(ex.getMessage().contains("Error al enviar lista de aumentos (admin)"));
    }

    @Test
    void sendAdminUtilityUpcomingChargeListEmail_fails() {
        EmailExtraAdminDTO dto = new EmailExtraAdminDTO();
        dto.setUtilities(java.util.List.of(new ExtrasForAdminEmailDTO()));

        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendAdminUtilityUpcomingChargeListEmail(dto));

        assertTrue(ex.getMessage().contains("Error al enviar lista de utilities (admin)"));
    }

    @Test
    void sendAdminContractsExpiringSoonListEmail_fails() {
        EmailContractExpiringSoonListAdminDTO dto = new EmailContractExpiringSoonListAdminDTO();
        dto.setContracts(java.util.List.of(new ContractExpiringForAdminDTO()));

        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendAdminContractsExpiringSoonListEmail(dto));

        assertTrue(ex.getMessage().contains("Error al enviar lista de contratos por vencer (admin)"));
    }

    @Test
    void sendAdminContractExpiredEmail_fails() {
        EmailContractExpiredAdminDTO dto = new EmailContractExpiredAdminDTO();
        dto.setPropertyId(1L);
        dto.setTenant("Juan Pérez");
        dto.setContractId(100L);

        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error interno"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendAdminContractExpiredEmail(dto));

        assertTrue(ex.getMessage().contains("Error al enviar notificación de contrato vencido (admin)"));
    }

    @Test
    void formatDate_null_returnsEmpty() {
        String result = (String)
                org.springframework.test.util.ReflectionTestUtils.invokeMethod(emailService, "formatDate", (Object) null);
        assertTrue(result.isEmpty());
    }

    @Test
    void formatAmount_null_returnsEmpty() {
        String result = (String)
                org.springframework.test.util.ReflectionTestUtils.invokeMethod(emailService, "formatAmount", (Object) null, "ARS");
        assertTrue(result.isEmpty());
    }
}