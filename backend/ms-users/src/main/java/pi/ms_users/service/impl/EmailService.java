package pi.ms_users.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import java.time.format.DateTimeFormatter;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import pi.ms_users.dto.EmailDTO;
import pi.ms_users.dto.EmailPropertyDTO;
import pi.ms_users.service.interf.IEmailService;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmailService implements IEmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    private String formatDate(LocalDateTime date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy 'a las' HH:mm", new Locale("es", "ES"));
        return date.format(formatter);
    }

    // cuando se crea un turno
    public void sendAppointmentRequest(EmailDTO emailDTO) throws MessagingException {
        try {
            Context context = new Context();
            context.setVariable("message", emailDTO.getDescription());
            context.setVariable("date", formatDate(emailDTO.getDate()));
            context.setVariable("firstName", emailDTO.getFirstName());
            context.setVariable("lastName", emailDTO.getLastName());
            context.setVariable("phone", emailDTO.getPhone());
            context.setVariable("to", emailDTO.getTo());

            // Email para inmobiliaria
            MimeMessage messageInmo = javaMailSender.createMimeMessage();
            MimeMessageHelper helperInmo = new MimeMessageHelper(messageInmo, true, "UTF-8");
            helperInmo.setTo("desarrolloinmobertibusso@gmail.com");
            helperInmo.setSubject("Nuevo turno solicitado");
            String contentInmo = templateEngine.process("email_inmobiliaria", context);
            helperInmo.setText(contentInmo, true);
            javaMailSender.send(messageInmo);

            // Email para cliente
            MimeMessage messageCliente = javaMailSender.createMimeMessage();
            MimeMessageHelper helperCliente = new MimeMessageHelper(messageCliente, true, "UTF-8");
            helperCliente.setTo(emailDTO.getTo());
            helperCliente.setSubject("Confirmación de turno - Oberti Busso Servicios Inmobiliarios");
            String contentCliente = templateEngine.process("email_client", context);
            helperCliente.setText(contentCliente, true);
            javaMailSender.send(messageCliente);

        } catch (Exception e) {
            throw new RuntimeException("Error al enviar los correos de solicitud: " + e.getMessage(), e);
        }
    }

    // cuando la inmobiliaria decide aceptarlo o rechazarlo
    public void sendAppointmentDecisionToClient(String clientEmail, boolean accepted, String firstName, LocalDateTime date) {
        try {
            Context context = new Context();
            context.setVariable("decision", accepted ? "aceptado" : "rechazado");
            context.setVariable("firstName", firstName);
            context.setVariable("date", formatDate(date));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(clientEmail);
            helper.setSubject("Estado de su turno - Oberti Busso Servicios Inmobiliarios");

            String templateName = accepted ? "email_accepted" : "email_declined";
            String content = templateEngine.process(templateName, context);
            helper.setText(content, true);
            javaMailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Error al enviar el correo de respuesta al cliente: " + e.getMessage(), e);
        }
    }

    // cuando el cliente cancela el turno
    public void sendAppointmentCancelledMail(EmailDTO emailDTO) {
        try {
            Context context = new Context();
            context.setVariable("firstName", emailDTO.getFirstName());
            context.setVariable("lastName", emailDTO.getLastName());
            context.setVariable("phone", emailDTO.getPhone());
            context.setVariable("mail", emailDTO.getTo());
            context.setVariable("date", formatDate(emailDTO.getDate()));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo("desarrolloinmobertibusso@gmail.com");
            helper.setSubject("Cancelación de turno");

            String content = templateEngine.process("email_canceled", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de cancelación: " + e.getMessage(), e);
        }
    }

    public void sendNotificationNewProperty(EmailPropertyDTO emailPropertyDTO) {
        try {
            Context context = new Context();
            context.setVariable("date", formatDate(emailPropertyDTO.getDate()));
            context.setVariable("propertyUrl", emailPropertyDTO.getPropertyUrl());
            context.setVariable("propertyDescription", emailPropertyDTO.getPropertyDescription());
            context.setVariable("propertyTitle", emailPropertyDTO.getPropertyTitle());
            context.setVariable("propertyImageUrl", emailPropertyDTO.getPropertyImageUrl());
            context.setVariable("propertyLocation", emailPropertyDTO.getPropertyLocation());
            context.setVariable("propertyPrice", emailPropertyDTO.getPropertyPrice());
            context.setVariable("propertyCurrency", emailPropertyDTO.getPropertyCurrency());
            context.setVariable("propertyOperation", emailPropertyDTO.getPropertyOperation());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(emailPropertyDTO.getTo());
            helper.setSubject("¡Nueva propiedad disponible que podría interesarte!");

            String content = templateEngine.process("email_new_property.html", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de nueva propiedad: " + e.getMessage(), e);
        }
    }
}

