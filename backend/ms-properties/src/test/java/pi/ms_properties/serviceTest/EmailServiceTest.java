package pi.ms_properties.serviceTest;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.shadow.com.univocity.parsers.common.Context;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.IContext;
import pi.ms_properties.configuration.components.AppProperties;
import pi.ms_properties.dto.EmailDTO;
import pi.ms_properties.service.impl.EmailService;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @InjectMocks
    private EmailService emailService;

    @Mock
    private JavaMailSender javaMailSender;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private AppProperties appProperties;

    @Mock
    private MimeMessage mimeMessage;

    @Captor
    private ArgumentCaptor<String> templateNameCaptor;

    @Captor
    private ArgumentCaptor<Context> contextCaptor;

    // casos de exito

    @Test
    void sendEmailInquiry_success() throws Exception {
        EmailDTO dto = new EmailDTO();
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setEmail("juan@example.com");
        dto.setPhone("123456789");
        dto.setDescription("Estoy interesado en una propiedad");
        dto.setDate(LocalDateTime.of(2024, 5, 22, 15, 30));
        dto.setPropertiesTitle(List.of("Casa en el centro", "Departamento en las afueras"));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_inquiry"), any(IContext.class))).thenReturn("<html>Email</html>");

        assertDoesNotThrow(() -> emailService.sendEmailInquiry(dto));

        ArgumentCaptor<String> templateNameCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<IContext> contextCaptor = ArgumentCaptor.forClass(IContext.class);

        verify(javaMailSender).send(mimeMessage);
        verify(templateEngine).process(templateNameCaptor.capture(), contextCaptor.capture());

        assertEquals("email_inquiry", templateNameCaptor.getValue());

        IContext context = contextCaptor.getValue();
        assertEquals("Juan", context.getVariable("firstName"));
        assertEquals("Pérez", context.getVariable("lastName"));
        assertEquals("juan@example.com", context.getVariable("email"));
        assertEquals("123456789", context.getVariable("phone"));
        assertEquals("Estoy interesado en una propiedad", context.getVariable("description"));
        assertEquals(List.of("Casa en el centro", "Departamento en las afueras"), context.getVariable("propertiesTitle"));
    }

    @Test
    void sendEmailSurvey_success() throws Exception {
        String emailTo = "cliente@ejemplo.com";
        Long inquiryId = 42L;

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://frontend.com");
        when(templateEngine.process(eq("email_survey"), any(IContext.class))).thenReturn("<html>Encuesta</html>");

        assertDoesNotThrow(() -> emailService.sendEmailSurvey(emailTo, inquiryId));

        ArgumentCaptor<String> templateNameCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<IContext> contextCaptor = ArgumentCaptor.forClass(IContext.class);

        verify(javaMailSender).send(mimeMessage);
        verify(templateEngine).process(templateNameCaptor.capture(), contextCaptor.capture());

        assertEquals("email_survey", templateNameCaptor.getValue());

        IContext context = contextCaptor.getValue();
        assertEquals("http://frontend.com/survey?inquiryId=42", context.getVariable("surveyLink"));
    }

    // casos de error

    @Test
    void sendEmailInquiry_shouldThrow_whenTemplateEngineFails() throws Exception {
        EmailDTO dto = new EmailDTO();
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setEmail("juan@example.com");
        dto.setPhone("123456789");
        dto.setDescription("Consulta");
        dto.setDate(LocalDateTime.now());
        dto.setPropertiesTitle(List.of("Casa"));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_inquiry"), any(IContext.class)))
                .thenThrow(new RuntimeException("Error al procesar plantilla"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> emailService.sendEmailInquiry(dto));

        assertTrue(ex.getMessage().contains("Error al enviar la consulta de propiedad"));
    }

    @Test
    void sendEmailSurvey_shouldThrow_whenJavaMailSenderFails() throws Exception {
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://localhost:3000");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error al crear mensaje"));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendEmailSurvey("test@example.com", 10L));

        assertTrue(ex.getMessage().contains("Error al enviar el email de encuesta"));
    }
}
