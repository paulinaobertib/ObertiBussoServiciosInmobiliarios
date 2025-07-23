package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import jakarta.mail.internet.MimeMessage;
import pi.ms_properties.configuration.components.AppProperties;
import pi.ms_properties.domain.ChatMessage;
import pi.ms_properties.domain.ChatOption;
import pi.ms_properties.domain.ChatSession;
import pi.ms_properties.dto.EmailChatDTO;
import pi.ms_properties.dto.EmailDTO;
import pi.ms_properties.service.interf.IChatMessageService;
import pi.ms_properties.service.interf.IEmailService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmailService implements IEmailService {

    private final JavaMailSender javaMailSender;

    private final TemplateEngine templateEngine;

    private final AppProperties appProperties;

    private final IChatMessageService chatMessageService;

    private String formatDate(LocalDateTime date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy 'a las' HH:mm", Locale.forLanguageTag("es-ES"));
        return date.format(formatter);
    }

    private EmailChatDTO buildEmailChatDTO(ChatSession chatSession, boolean derived, String agentName) {
        EmailChatDTO dto = new EmailChatDTO();
        dto.setFirstName(chatSession.getFirstName());
        dto.setLastName(chatSession.getLastName());
        dto.setEmail(chatSession.getEmail());
        dto.setPhone(chatSession.getPhone());
        dto.setPropertyTitle(chatSession.getProperty().getTitle());
        dto.setDerived(derived);
        dto.setAgentName(agentName);

        List<ChatMessage> chatMessages = chatMessageService.getBySession(chatSession.getId());

        List<String> readableMessages = chatMessages.stream()
                .map(ChatMessage::getChatOption)
                .map(this::mapOptionToText)
                .toList();

        dto.setChatOptions(readableMessages);
        return dto;
    }

    private String mapOptionToText(ChatOption option) {
        return switch (option) {
            case VER_PRECIO -> "Consultó por el precio de la propiedad";
            case VER_HABITACIONES -> "Consultó por la cantidad de habitaciones";
            case VER_AREA -> "Consultó por el área del inmueble";
            case VER_UBICACION -> "Consultó por la ubicación";
            case VER_CARACTERISTICAS -> "Consultó por las características";
            case VER_OPERACION -> "Consultó sobre el tipo de operación";
            case VER_CREDITO -> "Consultó sobre la posibilidad de crédito";
            case VER_FINANCIACION -> "Consultó sobre financiación";
            case DERIVAR -> "Solicitó hablar con un agente";
            case CERRAR -> "Cerró la consulta";
        };
    }

    @Override
    public void sendEmailInquiry(EmailDTO emailDTO) {
        try {
            Context context = new Context();
            context.setVariable("firstName", emailDTO.getFirstName());
            context.setVariable("lastName", emailDTO.getLastName());
            context.setVariable("email", emailDTO.getEmail());
            context.setVariable("phone", emailDTO.getPhone());
            context.setVariable("description", emailDTO.getDescription());
            context.setVariable("date", formatDate(emailDTO.getDate()));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo("desarrolloinmobertibusso@gmail.com");

            String content;
            if (emailDTO.getPropertiesTitle() == null || emailDTO.getPropertiesTitle().isEmpty()) {
                helper.setSubject("Nueva consulta");
                content = templateEngine.process("email_inquiry_without_property", context);
            } else {
                helper.setSubject("Nueva consulta de propiedad");
                context.setVariable("propertiesTitle", emailDTO.getPropertiesTitle());
                content = templateEngine.process("email_inquiry", context);
            }

            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar la consulta de propiedad: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendEmailSurvey(String emailTo, Long inquiryId) {
        try {
            Context context = new Context();
            String surveyLink = appProperties.getFrontendBaseUrl() + "/survey/" + inquiryId;
            context.setVariable("surveyLink", surveyLink);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(emailTo);
            helper.setSubject("¡Gracias por tu consulta!");

            String content = templateEngine.process("email_survey", context);
            helper.setText(content, true);

            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar el email de encuesta: " + e.getMessage(), e);
        }
    }

    public void sendChatSummaryEmail(ChatSession chatSession, Boolean derived, String agentName) {
        EmailChatDTO emailDTO = buildEmailChatDTO(chatSession, derived, agentName);

        try {
            Context context = new Context();
            context.setVariable("firstName", emailDTO.getFirstName());
            context.setVariable("lastName", emailDTO.getLastName());
            context.setVariable("email", emailDTO.getEmail());
            context.setVariable("phone", emailDTO.getPhone());
            context.setVariable("propertyTitle", emailDTO.getPropertyTitle());
            context.setVariable("chatOptions", emailDTO.getChatOptions());
            context.setVariable("derived", derived);
            context.setVariable("agentName", emailDTO.getAgentName());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo("desarrolloinmobertibusso@gmail.com");
            helper.setSubject("Resumen de consulta por chat");
            String content = templateEngine.process("email_chat_summary", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar resumen del chat: " + e.getMessage(), e);
        }
    }
}
