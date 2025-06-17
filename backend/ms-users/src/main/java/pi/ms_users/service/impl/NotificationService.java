package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import pi.ms_users.configuration.components.AppProperties;
import pi.ms_users.domain.Notification;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.User;
import pi.ms_users.domain.UserNotificationPreference;
import pi.ms_users.domain.feign.Property;
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

    private EmailPropertyDTO getEmailPropertyDTO(NotificationDTO notificationDTO, User user, Property property) {
        EmailPropertyDTO dto = new EmailPropertyDTO();
        dto.setTo(user.getMail());
        dto.setDate(notificationDTO.getDate());
        dto.setPropertyImageUrl(property.getMainImage());
        dto.setPropertyTitle(property.getTitle());
        dto.setPropertyLocation(property.getNeighborhood());
        NumberFormat price = NumberFormat.getCurrencyInstance(new Locale("es", "AR"));
        dto.setPropertyPrice(price.format(property.getPrice()));
        dto.setPropertyPrice(property.getPrice().toString());
        dto.setPropertyDescription(property.getDescription());
        dto.setPropertyUrl(appProperties.getFrontendBaseUrl() + "/properties/" + property.getId());
        dto.setPropertyCurrency(property.getCurrency());
        dto.setPropertyOperation(property.getOperation());
        return dto;
    }

    @Override
    public ResponseEntity<String> createProperty(NotificationDTO notificationDTO, Long propertyId) {
        if (notificationDTO.getType() != NotificationType.PROPIEDADNUEVA) {
            throw new IllegalArgumentException("Endpoint incorrecto para este tipo de notificación");
        }

        List<String> usersId = userNotificationPreferenceRepository.usersIdByTypeTrue(notificationDTO.getType());
        if (usersId.isEmpty()) {
            throw new IllegalArgumentException("No hay usuarios suscriptos a este tipo de notificación");
        }

        Property property = propertyRepository.getById(propertyId);

        for (String userId : usersId) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("El usuario con ID " + userId + " no existe"));

            EmailPropertyDTO dto = getEmailPropertyDTO(notificationDTO, user, property);
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

        if (!type.equals(NotificationType.PROPIEDADNUEVA)) {
            throw new NoSuchElementException("Tipo de notificacion incorrecta");
        }

        List<UserNotificationPreference> validUserId = userNotificationPreferenceRepository.findByUserId(userId);

        boolean hasActivePropiedadNueva = validUserId.stream()
                .anyMatch(pref ->
                        pref.getType() == NotificationType.PROPIEDADNUEVA &&
                                Boolean.TRUE.equals(pref.getEnabled())
                );

        if (!hasActivePropiedadNueva) {
            throw new IllegalArgumentException("El usuario no esta subscripto a este tipo de notificación");
        }

        Property property = propertyRepository.getById(propertyId);

        EmailPropertyDTO dto = new EmailPropertyDTO();
        dto.setTo(user.getMail());
        dto.setDate(LocalDateTime.now());
        dto.setPropertyTitle(property.getTitle());
        dto.setPropertyLocation(property.getNeighborhood());
        NumberFormat price = NumberFormat.getCurrencyInstance(new Locale("es", "AR"));
        dto.setPropertyPrice(price.format(property.getPrice()));
        dto.setPropertyCurrency(property.getCurrency());
        dto.setPropertyOperation(property.getOperation());
        dto.setPropertyDescription(property.getDescription());
        dto.setPropertyImageUrl(property.getMainImage());
        dto.setPropertyUrl(appProperties.getFrontendBaseUrl() + "/properties/" + property.getId());

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