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
import pi.ms_users.domain.ContractIncreaseCurrency;
import pi.ms_users.dto.*;
import pi.ms_users.service.impl.EmailService;

import java.math.BigDecimal;
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
        emailPropertyDTO.setPropertyUrl("https://propiedades.com/1");
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
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_accepted"), any())).thenReturn("contenido");

        emailService.sendAppointmentDecisionToClient("cliente@mail.com", true, "Juan", LocalDateTime.now(), "Calle");

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendAppointmentDecisionToClient_rejected_success() {
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_declined"), any())).thenReturn("contenido");

        emailService.sendAppointmentDecisionToClient("cliente@mail.com", false, "Juan", LocalDateTime.now(), "Calle");

        verify(javaMailSender).send(any(MimeMessage.class));
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

        emailService.sendNotificationNewProperty(emailPropertyDTO);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNewUserCredentialsEmail_success() {
        EmailNewUserDTO dto = new EmailNewUserDTO();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Credenciales");
        dto.setName("Juan");
        dto.setUserName("juan123");
        dto.setPassword("pass123");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_new_user"), any())).thenReturn("contenido");

        emailService.sendNewUserCredentialsEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendNewContractEmail_success() {
        EmailContractDTO dto = new EmailContractDTO();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Contrato nuevo");
        dto.setName("Juan");

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_new_contract"), any())).thenReturn("contenido");

        emailService.sendNewContractEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractIncreaseEmail_success() {
        EmailContractIncreaseDTO dto = new EmailContractIncreaseDTO();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Aumento de contrato");
        dto.setName("Juan");
        dto.setAmount(new BigDecimal("10000"));
        dto.setFrequency(30L);
        dto.setIncrease(10.0f);
        dto.setCurrency(ContractIncreaseCurrency.USD);

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_increase"), any())).thenReturn("contenido");

        emailService.sendContractIncreaseEmail(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendContractExpirationReminder_success() {
        EmailExpirationContract dto = new EmailExpirationContract();
        dto.setTo("cliente@mail.com");
        dto.setFrom("inmobiliaria@mail.com");
        dto.setTitle("Vencimiento de contrato");
        dto.setName("Juan");
        dto.setEndDate(LocalDateTime.of(2025, 12, 31, 0, 0));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_contract_expiration"), any())).thenReturn("contenido");

        emailService.sendContractExpirationReminder(dto);

        verify(javaMailSender).send(any(MimeMessage.class));
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
        dto.setName("Juan");

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
        dto.setName("Juan");
        dto.setAmount(new BigDecimal("10000"));
        dto.setFrequency(30L);
        dto.setIncrease(10.0f);
        dto.setCurrency(ContractIncreaseCurrency.USD);

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
        dto.setName("Juan");
        dto.setEndDate(LocalDateTime.of(2025, 12, 31, 0, 0));

        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendContractExpirationReminder(dto));

        assertTrue(ex.getMessage().contains("Error al enviar recordatorio de vencimiento"));
    }
}

