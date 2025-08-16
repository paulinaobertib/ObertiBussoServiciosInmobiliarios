package pi.ms_users.serviceTest;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import pi.ms_users.configuration.components.AppProperties;
import pi.ms_users.domain.Appointment;
import pi.ms_users.dto.*;
import org.thymeleaf.context.Context;
import pi.ms_users.service.impl.EmailService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
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
        when(templateEngine.process(eq("email_inmobiliaria"), any())).thenReturn("contenido-inmobiliaria");
        when(templateEngine.process(eq("email_client"), any())).thenReturn("contenido-cliente");

        emailService.sendAppointmentRequest(emailDTO);

        verify(javaMailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    void sendAppointmentDecisionToClient_accepted_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_accepted"), any())).thenReturn("contenido");

        emailService.sendAppointmentDecisionToClient(appointment.getId(), "cliente@mail.com", true, "Juan", LocalDateTime.now(), "Calle");

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAppointmentDecisionToClient_rejected_success() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_declined"), any())).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendAppointmentDecisionToClient(appointment.getId(),"cliente@mail.com", false, "Juan", LocalDateTime.now(), "Calle");

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendApologyForCancelledAppointment_success() throws Exception {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_apology_cancelled"), any(Context.class))).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendApologyForCancelledAppointment(1L, "cliente@mail.com", "Juan", LocalDateTime.of(2025, 6, 15, 10, 0));

        verify(javaMailSender).send(mimeMessage);
        verify(templateEngine).process(eq("email_apology_cancelled"), any(Context.class));
    }

    @Test
    void sendAppointmentCancelledMail_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_canceled"), any())).thenReturn("cancelado");

        emailService.sendAppointmentCancelledMail(emailDTO);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNotificationNewProperty_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_new_property.html"), any())).thenReturn("nueva-propiedad");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendNotificationNewProperty(emailPropertyDTO);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNewUserCredentialsEmail_success() {
        EmailNewUserDTO dto = new EmailNewUserDTO();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Credenciales");
        dto.setFirstName("Juan");
        dto.setUserName("juan123");
        dto.setPassword("pass123");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_new_user"), any())).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendNewUserCredentialsEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNewContractEmail_success() {
        EmailContractDTO dto = new EmailContractDTO();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Contrato nuevo");
        dto.setFirstName("Juan");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_new_contract"), any())).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendNewContractEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractIncreaseEmail_success() {
        EmailContractIncreaseDTO dto = new EmailContractIncreaseDTO();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Aumento de contrato");
        dto.setFirstName("Juan");
        dto.setAmount(new BigDecimal("10000"));
        dto.setFrequency(30L);
        dto.setIncrease(10.0f);
        dto.setCurrency(ContractIncreaseCurrency.USD);

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_increase"), any())).thenReturn("contenido");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendContractIncreaseEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractExpirationReminder_success() {
        EmailExpirationContract dto = new EmailExpirationContract();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Vencimiento de contrato");
        dto.setFirstName("Juan");
        dto.setEndDate(LocalDateTime.of(2025, 12, 31, 0, 0));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_expiration"), any())).thenReturn("contenido");

        emailService.sendContractExpirationReminder(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNotificationNewInterestProperty_shouldSendEmailSuccessfully() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>email content</html>");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        emailService.sendNotificationNewInterestProperty(emailPropertyDTO);

        verify(javaMailSender).createMimeMessage();
        verify(templateEngine).process(eq("email_new_interest_property.html"), any(Context.class));
        verify(javaMailSender).send(mimeMessage);
    }

    @Test
    void sendRentPaymentReminder_success() {
        // Preparar el DTO con datos de ejemplo
        EmailPaymentReminderDTO dto = new EmailPaymentReminderDTO();
        dto.setTo("cliente@mail.com");
        dto.setFirstName("Juan");
        dto.setAmount(new BigDecimal("15000"));
        dto.setCurrency(ContractIncreaseCurrency.ARS);
        dto.setDueDate(LocalDate.of(2025, 7, 2));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_rent_payment_reminder"), any(Context.class))).thenReturn("contenido-email");

        emailService.sendRentPaymentReminder(dto);

        verify(javaMailSender).send(mimeMessage);
        verify(templateEngine).process(eq("email_rent_payment_reminder"), any(Context.class));
    }


    // casos de error

    @Test
    void sendAppointmentRequest_fails() {
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Fallo"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendAppointmentRequest(emailDTO));

        assertTrue(ex.getMessage().contains("Error al enviar los correos de solicitud"));
    }

    @Test
    void sendAppointmentCancelledMail_fails() {
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendAppointmentCancelledMail(emailDTO));

        assertTrue(ex.getMessage().contains("Error al enviar correo de cancelación"));
    }

    @Test
    void sendNotificationNewProperty_fails() {
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendNotificationNewProperty(emailPropertyDTO));

        assertTrue(ex.getMessage().contains("Error al enviar correo de nueva propiedad"));
    }

    @Test
    void sendNewContractEmail_fails() {
        EmailContractDTO dto = new EmailContractDTO();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Contrato nuevo");
        dto.setFirstName("Juan");

        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendNewContractEmail(dto));

        assertTrue(ex.getMessage().contains("Error al enviar el correo de nuevo contrato"));
    }

    @Test
    void sendContractIncreaseEmail_fails() {
        EmailContractIncreaseDTO dto = new EmailContractIncreaseDTO();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Aumento");
        dto.setFirstName("Juan");
        dto.setAmount(new BigDecimal("10000"));
        dto.setFrequency(30L);
        dto.setIncrease(10.0f);
        dto.setCurrency(ContractIncreaseCurrency.USD);

        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendContractIncreaseEmail(dto));

        assertTrue(ex.getMessage().contains("Error al enviar el correo de aumento de contrato"));
    }

    @Test
    void sendContractExpirationReminder_fails() {
        EmailExpirationContract dto = new EmailExpirationContract();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Vencimiento");
        dto.setFirstName("Juan");
        dto.setEndDate(LocalDateTime.of(2025, 12, 31, 0, 0));

        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendContractExpirationReminder(dto));

        assertTrue(ex.getMessage().contains("Error al enviar recordatorio de vencimiento"));
    }

    @Test
    void sendNotificationNewInterestProperty_shouldThrowRuntimeException_whenSendFails() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>email content</html>");
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend");

        doThrow(new RuntimeException(new MessagingException("Error al enviar"))).when(javaMailSender).send(mimeMessage);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                emailService.sendNotificationNewInterestProperty(emailPropertyDTO)
        );

        assertTrue(ex.getMessage().contains("Error al enviar correo de nueva propiedad"));
    }
}