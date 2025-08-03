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
import pi.ms_properties.domain.ChatMessage;
import pi.ms_properties.domain.ChatOption;
import pi.ms_properties.domain.ChatSession;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.EmailDTO;
import pi.ms_properties.service.impl.EmailService;
import pi.ms_properties.service.interf.IChatMessageService;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
    private AppProperties appProperties;

    @Mock
    private MimeMessage mimeMessage;

    @Mock
    private IChatMessageService chatMessageService;

    @Captor
    private ArgumentCaptor<String> templateNameCaptor;

    @Captor
    ArgumentCaptor<IContext> iContextCaptor;

    // casos de exito

    @Test
    void sendEmailInquiry_success() {
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

        verify(javaMailSender).send(mimeMessage);
        verify(templateEngine).process(templateNameCaptor.capture(), iContextCaptor.capture());

        assertEquals("email_inquiry", templateNameCaptor.getValue());

        IContext context = iContextCaptor.getValue();
        assertEquals("Juan", context.getVariable("firstName"));
        assertEquals("Pérez", context.getVariable("lastName"));
        assertEquals("juan@example.com", context.getVariable("email"));
        assertEquals("123456789", context.getVariable("phone"));
        assertEquals("Estoy interesado en una propiedad", context.getVariable("description"));
        assertEquals(List.of("Casa en el centro", "Departamento en las afueras"), context.getVariable("propertiesTitle"));
    }

    @Test
    void sendEmailInquiry_withoutProperties_success() {
        EmailDTO dto = new EmailDTO();
        dto.setFirstName("Ana");
        dto.setLastName("García");
        dto.setEmail("ana@example.com");
        dto.setPhone("987654321");
        dto.setDescription("Consulta general sin propiedades");
        dto.setDate(LocalDateTime.of(2024, 6, 1, 10, 15));
        dto.setPropertiesTitle(Collections.emptyList());

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_inquiry_without_property"), any(IContext.class))).thenReturn("<html>Email sin propiedad</html>");

        assertDoesNotThrow(() -> emailService.sendEmailInquiry(dto));

        verify(javaMailSender).send(mimeMessage);
        verify(templateEngine).process(templateNameCaptor.capture(), iContextCaptor.capture());

        assertEquals("email_inquiry_without_property", templateNameCaptor.getValue());

        IContext context = iContextCaptor.getValue();
        assertEquals("Ana", context.getVariable("firstName"));
        assertEquals("García", context.getVariable("lastName"));
        assertEquals("ana@example.com", context.getVariable("email"));
        assertEquals("987654321", context.getVariable("phone"));
        assertEquals("Consulta general sin propiedades", context.getVariable("description"));
    }

    @Test
    void sendEmailSurvey_success() {
        String emailTo = "cliente@ejemplo.com";
        Long inquiryId = 42L;
        String token = "ABC123TOKEN";

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(appProperties.getFrontendBaseUrl()).thenReturn("https://frontend.com");
        when(templateEngine.process(eq("email_survey"), any(IContext.class))).thenReturn("<html>Encuesta</html>");

        assertDoesNotThrow(() -> emailService.sendEmailSurvey(emailTo, inquiryId, token));

        ArgumentCaptor<String> templateNameCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<IContext> contextCaptor = ArgumentCaptor.forClass(IContext.class);

        verify(javaMailSender).send(mimeMessage);
        verify(templateEngine).process(templateNameCaptor.capture(), contextCaptor.capture());

        assertEquals("email_survey", templateNameCaptor.getValue());

        IContext context = contextCaptor.getValue();
        String expectedLink = "https://frontend.com/survey/" + inquiryId + "/" + token;
        assertEquals(expectedLink, context.getVariable("surveyLink"));
    }

    @Test
    void sendChatSummaryEmail_shouldSendEmailSuccessfully() throws Exception {
        ChatSession chatSession = new ChatSession();
        chatSession.setId(1L);
        chatSession.setFirstName("Juan");
        chatSession.setLastName("Pérez");
        chatSession.setEmail("juan@example.com");
        chatSession.setPhone("123456789");
        Property property = new Property();
        property.setTitle("Casa en el centro");
        chatSession.setProperty(property);

        ChatMessage msg1 = new ChatMessage();
        msg1.setChatOption(ChatOption.VER_PRECIO);
        ChatMessage msg2 = new ChatMessage();
        msg2.setChatOption(ChatOption.VER_UBICACION);

        when(chatMessageService.getBySession(1L)).thenReturn(List.of(msg1, msg2));

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_chat_summary"), any(IContext.class))).thenReturn("<html>Resumen</html>");

        emailService.sendChatSummaryEmail(chatSession, true, "Agente 1");

        verify(javaMailSender).send(mimeMessage);
        verify(templateEngine).process(templateNameCaptor.capture(), iContextCaptor.capture());

        assertEquals("email_chat_summary", templateNameCaptor.getValue());

        IContext iContext = iContextCaptor.getValue();

        if (iContext instanceof Context context) {
            Field variablesField = Context.class.getDeclaredField("variables");
            variablesField.setAccessible(true);
            @SuppressWarnings("unchecked")
            Map<String, Object> variables = (Map<String, Object>) variablesField.get(context);

            assertEquals("Juan", variables.get("firstName"));
            assertEquals("Pérez", variables.get("lastName"));
            assertEquals("juan@example.com", variables.get("email"));
            assertEquals("123456789", variables.get("phone"));
            assertEquals("Casa en el centro", variables.get("propertyTitle"));
            assertEquals(List.of(
                    "Consultó por el precio de la propiedad",
                    "Consultó por la ubicación"
            ), variables.get("chatOptions"));
            assertEquals(true, variables.get("derived"));
            assertEquals("Agente 1", variables.get("agentName"));
        }
    }

    // casos de error

    @Test
    void sendEmailInquiry_shouldThrow_whenTemplateEngineFails() {
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
    void sendEmailSurvey_shouldThrow_whenJavaMailSenderFails() {
        when(appProperties.getFrontendBaseUrl()).thenReturn("http://localhost:3000");
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("Error al crear mensaje"));

        String token = "ABC123TOKEN";

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> emailService.sendEmailSurvey("test@example.com", 10L, token));

        assertTrue(ex.getMessage().contains("Error al enviar el email de encuesta"));
    }

    @Test
    void sendChatSummaryEmail_shouldThrowRuntimeException_whenJavaMailSenderFails() {
        ChatSession chatSession = new ChatSession();
        chatSession.setId(1L);
        chatSession.setFirstName("Juan");
        chatSession.setLastName("Pérez");
        chatSession.setEmail("juan@example.com");
        chatSession.setPhone("123456789");
        Property property = new Property();
        property.setTitle("Casa en el centro");
        chatSession.setProperty(property);

        when(chatMessageService.getBySession(1L)).thenReturn(List.of());

        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(templateEngine.process(eq("email_chat_summary"), any(IContext.class))).thenReturn("<html>Resumen</html>");
        doThrow(new RuntimeException("SMTP error")).when(javaMailSender).send(any(MimeMessage.class));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                emailService.sendChatSummaryEmail(chatSession, false, "Agente X"));

        assertTrue(ex.getMessage().contains("Error al enviar resumen del chat"));
    }
}
