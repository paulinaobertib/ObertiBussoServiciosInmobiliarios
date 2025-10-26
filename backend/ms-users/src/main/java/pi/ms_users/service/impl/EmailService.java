package pi.ms_users.service.impl;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import pi.ms_users.configuration.components.AppProperties;
import pi.ms_users.dto.email.*;
import pi.ms_users.service.interf.IEmailService;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmailService implements IEmailService {

    private final AppProperties appProperties;

    private final JavaMailSender javaMailSender;

    private final TemplateEngine templateEngine;

    private String formatDateTime(LocalDateTime date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy 'a las' HH:mm", Locale.forLanguageTag("es-AR"));
        return date.format(formatter);
    }

    private String formatDate(LocalDate date) {
        if (date == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", Locale.forLanguageTag("es-AR"));
        return date.format(formatter);
    }

    private String formatAmount(BigDecimal amount, String currency) {
        if (amount == null) return "";
        String prefix = (currency == null) ? "" : (currency.equalsIgnoreCase("USD") ? "USD " : "ARS ");
        Locale locale = Locale.forLanguageTag("es-AR");
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);
        return prefix + nf.format(amount);
    }

    private void setEmailContextVariables(Context context, EmailPropertyDTO dto) {
        context.setVariable("date", formatDateTime(dto.getDate()));
        String propertyUrl = appProperties.getFrontendBaseUrl() + "/properties/" + dto.getPropertyId();
        context.setVariable("propertyUrl", propertyUrl);
        context.setVariable("propertyDescription", dto.getPropertyDescription());
        context.setVariable("propertyTitle", dto.getPropertyTitle());
        context.setVariable("propertyImageUrl", dto.getPropertyImageUrl());
        context.setVariable("propertyLocation", dto.getPropertyLocation());
        context.setVariable("propertyPrice", dto.getPropertyPrice());
        context.setVariable("propertyCurrency", dto.getPropertyCurrency());
        context.setVariable("propertyOperation", dto.getPropertyOperation());
    }

    // cuando se crea un turno
    @Override
    public void sendAppointmentRequest(EmailDTO emailDTO) {
        try {
            Context context = new Context();
            context.setVariable("message", emailDTO.getDescription());
            context.setVariable("date", formatDateTime(emailDTO.getDate()));
            context.setVariable("firstName", emailDTO.getFirstName());
            context.setVariable("lastName", emailDTO.getLastName());
            context.setVariable("phone", emailDTO.getPhone());
            context.setVariable("to", emailDTO.getTo());
            context.setVariable("comment", emailDTO.getComment());

            // Email para inmobiliaria
            MimeMessage messageInmo = javaMailSender.createMimeMessage();
            MimeMessageHelper helperInmo = new MimeMessageHelper(messageInmo, true, "UTF-8");
            helperInmo.setTo(appProperties.getEmailInmobiliaria());
            helperInmo.setSubject("Nuevo turno solicitado");
            String contentInmo = templateEngine.process("email_inmobiliaria", context);
            helperInmo.setText(contentInmo, true);
            javaMailSender.send(messageInmo);

            // Email para cliente
            MimeMessage messageCliente = javaMailSender.createMimeMessage();
            MimeMessageHelper helperCliente = new MimeMessageHelper(messageCliente, true, "UTF-8");
            helperCliente.setTo(emailDTO.getTo());
            helperCliente.setSubject("Solicitud de turno - Oberti Busso Servicios Inmobiliarios");
            String contentCliente = templateEngine.process("email_client", context);
            helperCliente.setText(contentCliente, true);
            javaMailSender.send(messageCliente);

        } catch (Exception e) {
            throw new RuntimeException("Error al enviar los correos de solicitud: " + e.getMessage(), e);
        }
    }

    // cuando la inmobiliaria decide aceptarlo o rechazarlo
    @Override
    public void sendAppointmentDecisionToClient(Long appointmentId, String clientEmail, boolean accepted, String firstName, LocalDateTime date, String address) {
        try {
            Context context = new Context();
            context.setVariable("decision", accepted ? "aceptado" : "rechazado");
            context.setVariable("firstName", firstName);
            context.setVariable("date", formatDateTime(date));

            if (!(address == null) && !address.isEmpty()) {
                context.setVariable("address", address);
            }

            if(!accepted) {
                String rescheduleUrl = appProperties.getFrontendBaseUrl() + "/contact";
                context.setVariable("rescheduleUrl", rescheduleUrl);
            }

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

    // cuando la inmobiliaria habia aceptado el turno, pero lo tiene que rechazar
    @Override
    public void sendApologyForCancelledAppointment(Long appointmentId, String clientEmail, String firstName, LocalDateTime date) {
        try {
            Context context = new Context();
            context.setVariable("firstName", firstName);
            context.setVariable("date", formatDateTime(date));
            String rescheduleUrl = appProperties.getFrontendBaseUrl() + "/contact";
            context.setVariable("rescheduleUrl", rescheduleUrl);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(clientEmail);
            helper.setSubject("Lamentamos cancelar tu turno - Oberti Busso Servicios Inmobiliarios");

            String content = templateEngine.process("email_apology_cancelled", context);
            helper.setText(content, true);
            javaMailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Error al enviar el correo de disculpas al cliente: " + e.getMessage(), e);
        }
    }

    // cuando el cliente cancela el turno
    @Override
    public void sendAppointmentCancelledMail(EmailDTO emailDTO) {
        try {
            Context context = new Context();
            context.setVariable("firstName", emailDTO.getFirstName());
            context.setVariable("lastName", emailDTO.getLastName());
            context.setVariable("phone", emailDTO.getPhone());
            context.setVariable("mail", emailDTO.getTo());
            context.setVariable("date", formatDateTime(emailDTO.getDate()));
            context.setVariable("comment", emailDTO.getComment());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(appProperties.getEmailInmobiliaria());
            helper.setSubject("Cancelación de turno");

            String content = templateEngine.process("email_canceled", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de cancelación: " + e.getMessage(), e);
        }
    }

    // cuando se agrega una nueva propiedad
    @Override
    public void sendNotificationNewProperty(EmailPropertyDTO emailPropertyDTO) {
        try {
            Context context = new Context();
            setEmailContextVariables(context, emailPropertyDTO);

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

    // cuando hay una propiedad que puede ser de interes para el cliente
    @Override
    public void sendNotificationNewInterestProperty(EmailPropertyDTO emailPropertyDTO) {
        try {
            Context context = new Context();
            setEmailContextVariables(context, emailPropertyDTO);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(emailPropertyDTO.getTo());
            helper.setSubject("¡Nueva propiedad disponible que podría interesarte!");

            String content = templateEngine.process("email_new_interest_property.html", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de nueva propiedad: " + e.getMessage(), e);
        }
    }

    // cuando el administrador le crea un usuario al inquilino
    @Override
    public void sendNewUserCredentialsEmail(EmailNewUserDTO emailData) {
        try {
            Context context = new Context();
            context.setVariable("name", emailData.getFirstName());
            context.setVariable("username", emailData.getUserName());
            context.setVariable("password", emailData.getPassword());
            //LINK
            String loginUrl = appProperties.getFrontendBaseUrl() + "/";
            context.setVariable("loginUrl", loginUrl);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(emailData.getTo());
            helper.setSubject(emailData.getTitle());

            String content = templateEngine.process("email_new_user", context);
            helper.setText(content, true);

            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar el correo de creación de usuario: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendNewContractEmail(EmailNewContractDTO dto, Long contractId) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts" + contractId;

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("startDate", formatDate(dto.getStartDate()));
            context.setVariable("endDate", formatDate(dto.getEndDate()));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Inicio de contrato");

            String content = templateEngine.process("email_new_contract", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de nuevo contrato: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendContractExpiredEmail(EmailExpiredContractDTO dto) {
        try {
            Context context = new Context();
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("endDate", formatDate(dto.getEndDate()));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Finalización de contrato");

            String content = templateEngine.process("email_expired_contract_user", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de contrato vencido: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendContractExpiringSoonEmail(EmailContractExpiringSoonDTO dto, Long contractId) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts" + contractId;

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("endDate", formatDate(dto.getEndDate()));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Tu contrato finaliza pronto");

            String content = templateEngine.process("email_contract_expiring_soon_user", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de contrato por vencer: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendContractUpcomingIncreaseOneMonthEmail(EmailContractUpcomingIncreaseOneMonthDTO dto, Long contractId) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts" + contractId;

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("index", dto.getIndex());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Aviso de actualización contractual");

            String content = templateEngine.process("email_contract_soon_month_increase", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar aviso de aumento próximo: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendContractIncreaseLoadedEmail(EmailContractIncreaseLoadedDTO dto, Long contractId) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts" + contractId;

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("newAmount", formatAmount(dto.getNewAmount(), dto.getCurrency()));
            context.setVariable("increase", dto.getIncrease());
            context.setVariable("index", dto.getIndex());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Actualización de contrato aplicada");

            String content = templateEngine.process("email_contract_increased_user", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de aumento aplicado: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendContractIncreaseLoadedEmailUpdate(EmailContractIncreaseLoadedDTO dto, Long contractId) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts" + contractId;

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("newAmount", formatAmount(dto.getNewAmount(), dto.getCurrency()));
            context.setVariable("increase", dto.getIncrease());
            context.setVariable("index", dto.getIndex());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Actualización de contrato aplicada");

            String content = templateEngine.process("email_contract_increased_user_update", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo de aumento aplicado: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendContractPaymentReminderEmail(EmailContractPaymentReminderDTO dto, Long contractId) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts" + contractId;

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("dueDate", formatDate(dto.getDueDate()));
            context.setVariable("amount", formatAmount(dto.getAmount(), dto.getCurrency()));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Recordatorio de pago");

            String content = templateEngine.process("email_contract_payment_reminder", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar recordatorio de pago de alquiler: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendUtilityPaymentReminderEmail(EmailUtilityPaymentReminderDTO dto, Long contractId) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts" + contractId;

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("utilityName", dto.getUtilityName());
            context.setVariable("periodicity", dto.getPeriodicity());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Recordatorio de pago de servicio");

            String content = templateEngine.process("email_extra_payment_reminder", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar recordatorio de utility: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendUtilityAmountLoadedEmail(EmailUtilityAmountLoadedDTO dto, Long contractId) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts" + contractId;

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("utilityName", dto.getUtilityName());
            context.setVariable("amount", formatAmount(dto.getAmount(), null));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Importe de servicio actualizado");

            String content = templateEngine.process("email_extra_amount_loaded_user", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar monto cargado de utility: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendUtilityAmountLoadedEmailUpdate(EmailUtilityAmountLoadedDTO dto, Long contractId) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts" + contractId;

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("firstName", dto.getFirstName());
            context.setVariable("lastName", dto.getLastName());
            context.setVariable("utilityName", dto.getUtilityName());
            context.setVariable("amount", formatAmount(dto.getAmount(), null));

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(dto.getTo());
            helper.setSubject("Importe de servicio actualizado");

            String content = templateEngine.process("email_extra_amount_loaded_user_update", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar monto cargado de utility: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendAdminContractUpcomingIncreaseListEmail(EmailContractIncreaseAdminDTO dto) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts";

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("contracts", dto.getContracts());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(appProperties.getEmailInmobiliaria());
            helper.setSubject("Contratos con ajustes programados");

            String content = templateEngine.process("email_contract_increase_admin", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar lista de aumentos (admin): " + e.getMessage(), e);
        }
    }

    @Override
    public void sendAdminUtilityUpcomingChargeListEmail(EmailExtraAdminDTO dto) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts";

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("utilities", dto.getUtilities());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(appProperties.getEmailInmobiliaria());
            helper.setSubject("Servicios con vencimiento próximo");

            String content = templateEngine.process("email_extra_payment_admin", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar lista de utilities (admin): " + e.getMessage(), e);
        }
    }

    @Override
    public void sendAdminContractsExpiringSoonListEmail(EmailContractExpiringSoonListAdminDTO dto) {
        try {
            String contractUrl = appProperties.getFrontendBaseUrl() + "/contracts";

            Context context = new Context();
            context.setVariable("contractUrl", contractUrl);
            context.setVariable("contracts", dto.getContracts());

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(appProperties.getEmailInmobiliaria());
            helper.setSubject("Contratos próximos a vencer");

            String content = templateEngine.process("email_contracts_soon_expiring_admin", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar lista de contratos por vencer (admin): " + e.getMessage(), e);
        }
    }

    @Override
    public void sendAdminContractExpiredEmail(EmailContractExpiredAdminDTO dto) {
        try {
            String propertyUrl = appProperties.getFrontendBaseUrl() + "/properties/" + dto.getPropertyId();

            Context context = new Context();
            context.setVariable("propertyId", dto.getPropertyId());
            context.setVariable("tenant", dto.getTenant());
            context.setVariable("contractId", dto.getContractId());
            context.setVariable("propertyUrl", propertyUrl);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(appProperties.getEmailInmobiliaria());
            helper.setSubject("Contrato vencido - Acción requerida");

            String content = templateEngine.process("email_contract_expired_admin", context);
            helper.setText(content, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar notificación de contrato vencido (admin): " + e.getMessage(), e);
        }
    }

}
