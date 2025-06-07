package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import jakarta.mail.internet.MimeMessage;
import pi.ms_properties.configuration.components.AppProperties;
import pi.ms_properties.dto.EmailDTO;
import pi.ms_properties.service.interf.IEmailService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmailService implements IEmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;
    private final AppProperties appProperties;

    private String formatDate(LocalDateTime date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy 'a las' HH:mm", new Locale("es", "ES"));
        return date.format(formatter);
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
            context.setVariable("propertiesTitle", emailDTO.getPropertiesTitle());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo("desarrolloinmobertibusso@gmail.com");
            helper.setSubject("Nueva consulta de propiedad");
            String content = templateEngine.process("email_inquiry", context);
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
            String surveyLink = appProperties.getFrontendBaseUrl() + "/survey?inquiryId=" + inquiryId;
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
}
