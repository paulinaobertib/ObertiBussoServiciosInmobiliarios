package pi.ms_users.service.impl;

import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.configuration.components.AppProperties;
import pi.ms_users.domain.Favorite;
import pi.ms_users.domain.Notification;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.User;
import pi.ms_users.domain.feign.Property;
import pi.ms_users.dto.EmailPropertyDTO;
import pi.ms_users.dto.NotificationDTO;
import pi.ms_users.repository.INotificationRepository;
import pi.ms_users.repository.IUserNotificationPreferenceRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.service.interf.IEmailService;
import pi.ms_users.service.interf.INotificationService;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

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
        try {
            if (notificationDTO.getType() != NotificationType.PROPIEDADNUEVA) {
                return ResponseEntity.badRequest().body("Endpoint incorrecto para este tipo de notificacion");
            }

            List<String> usersId = userNotificationPreferenceRepository.usersIdByType(notificationDTO.getType());

            if (usersId.isEmpty()) {
                return ResponseEntity.badRequest().body("No hay usuarios suscriptos a este tipo de notificacion");
            }

            Property property = propertyRepository.getById(propertyId);

            for (String userId : usersId) {
                Optional<User> optionalUser = userRepository.findById(userId);

                if (optionalUser.isEmpty()) {
                    return ResponseEntity.badRequest().body("El usuario con ID " + userId + " no existe");
                }

                User user = optionalUser.get();

                EmailPropertyDTO dto = getEmailPropertyDTO(notificationDTO, user, property);

                emailService.sendNotificationNewProperty(dto);

                // guardamos la notificacion que enviamos
                Notification notification = new Notification();
                notification.setUserId(user.getId());
                notification.setType(notificationDTO.getType());
                notification.setDate(notificationDTO.getDate());

                notificationRepository.save(notification);
            }

            return ResponseEntity.ok("Se han enviado las notificaciones correctamente");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Notification> getById(Long id) {
        try {
            Optional<Notification> notification = notificationRepository.findById(id);
            return notification.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Notification>> getAll() {
        try {
            List<Notification> notifications = notificationRepository.findAll();
            return ResponseEntity.ok(notifications);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Notification>> getByUserId(String userId) {
        try {
            Optional<User> user = Optional.empty();
            try {
                user = userRepository.findById(userId);
            } catch (NotFoundException e) {
                return ResponseEntity.notFound().build();
            }

            List<Notification> notifications = notificationRepository.findByUserId(userId);
            return ResponseEntity.ok(notifications);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}