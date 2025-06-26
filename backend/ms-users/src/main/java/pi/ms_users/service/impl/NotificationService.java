package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import pi.ms_users.configuration.components.AppProperties;
import pi.ms_users.domain.Notification;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.User;
import pi.ms_users.domain.UserNotificationPreference;
import pi.ms_users.dto.feign.PropertyDTO;
import pi.ms_users.dto.EmailPropertyDTO;
import pi.ms_users.dto.NotificationDTO;
import pi.ms_users.repository.INotificationRepository;
import pi.ms_users.repository.IUserNotificationPreferenceRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.IEmailService;
import pi.ms_users.service.interf.INotificationService;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final AppProperties appProperties;

    private final INotificationRepository notificationRepository;

    private final IUserNotificationPreferenceRepository userNotificationPreferenceRepository;

    private final IUserRepository userRepository;

    private final IEmailService emailService;

    private final PropertyRepository propertyRepository;

    private EmailPropertyDTO getEmailPropertyDTO(NotificationDTO notificationDTO, User user, PropertyDTO propertyDTO) {
        EmailPropertyDTO dto = new EmailPropertyDTO();
        dto.setTo(user.getEmail());
        dto.setDate(notificationDTO.getDate());
        dto.setPropertyImageUrl(propertyDTO.getMainImage());
        dto.setPropertyTitle(propertyDTO.getTitle());
        dto.setPropertyLocation(propertyDTO.getNeighborhood());
        NumberFormat price = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("es-AR"));
        dto.setPropertyPrice(price.format(propertyDTO.getPrice()));
        dto.setPropertyPrice(propertyDTO.getPrice().toString());
        dto.setPropertyDescription(propertyDTO.getDescription());
        dto.setPropertyUrl(appProperties.getFrontendBaseUrl() + "/properties/" + propertyDTO.getId());
        dto.setPropertyCurrency(propertyDTO.getCurrency());
        dto.setPropertyOperation(propertyDTO.getOperation());
        return dto;
    }

    @Override
    public ResponseEntity<String> createProperty(NotificationDTO notificationDTO, Long propertyId) {
        if (notificationDTO.getType() != NotificationType.PROPIEDADNUEVA) {
            throw new IllegalArgumentException("Endpoint incorrecto para este tipo de notificación");
        }

        List<String> usersId = userNotificationPreferenceRepository.usersIdByTypeTrue(notificationDTO.getType());
        if (usersId.isEmpty()) {
           return ResponseEntity.ok("No hay usuarios suscriptos. Notificación omitida.");
        }

        PropertyDTO propertyDTO = propertyRepository.getById(propertyId);

        for (String userId : usersId) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("El usuario con ID " + userId + " no existe"));

            EmailPropertyDTO dto = getEmailPropertyDTO(notificationDTO, user, propertyDTO);
            emailService.sendNotificationNewProperty(dto);

            Notification notification = new Notification();
            notification.setUserId(user.getId());
            notification.setType(notificationDTO.getType());
            notification.setDate(notificationDTO.getDate());

            notificationRepository.save(notification);
        }

        return ResponseEntity.ok("Se han enviado las notificaciones correctamente");
    }

    @Override
    public ResponseEntity<String> propertyInterest(String userId, NotificationType type, Long propertyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        if (!type.equals(NotificationType.PROPIEDADINTERES)) {
            throw new NoSuchElementException("Tipo de notificacion incorrecta");
        }

        List<UserNotificationPreference> validUserId = userNotificationPreferenceRepository.findByUserId(userId);
        if (validUserId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No hay usuarios suscriptos a este tipo de notificacion");
        }

        boolean hasActivePropiedadInteres = validUserId.stream()
                .anyMatch(pref ->
                        pref.getType() == NotificationType.PROPIEDADINTERES &&
                                Boolean.TRUE.equals(pref.getEnabled())
                );

        if (!hasActivePropiedadInteres) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("El usuario no está suscripto a este tipo de notificación");
        }

        PropertyDTO propertyDTO = propertyRepository.getById(propertyId);

        EmailPropertyDTO dto = new EmailPropertyDTO();
        dto.setTo(user.getEmail());
        dto.setDate(LocalDateTime.now());
        dto.setPropertyTitle(propertyDTO.getTitle());
        dto.setPropertyLocation(propertyDTO.getNeighborhood());
        NumberFormat price = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("es-AR"));
        dto.setPropertyPrice(price.format(propertyDTO.getPrice()));
        dto.setPropertyCurrency(propertyDTO.getCurrency());
        dto.setPropertyOperation(propertyDTO.getOperation());
        dto.setPropertyDescription(propertyDTO.getDescription());
        dto.setPropertyImageUrl(propertyDTO.getMainImage());
        dto.setPropertyUrl(appProperties.getFrontendBaseUrl() + "/properties/" + propertyDTO.getId());

        emailService.sendNotificationNewInterestProperty(dto);

        return ResponseEntity.ok("Notificación enviada correctamente");
    }

    @Override
    public ResponseEntity<Notification> getById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la notificación con ID: " + id));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !notification.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        return ResponseEntity.ok(notification);
    }

    @Override
    public ResponseEntity<List<Notification>> getAll() {
        List<Notification> notifications = notificationRepository.findAll();
        return ResponseEntity.ok(notifications);
    }

    @Override
    public ResponseEntity<List<Notification>> getByUserId(String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el usuario con ID: " + userId));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !userId.equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        List<Notification> notifications = notificationRepository.findByUserId(userId);
        return ResponseEntity.ok(notifications);
    }
}