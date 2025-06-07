package pi.ms_users.service.impl;

import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.User;
import pi.ms_users.domain.UserNotificationPreference;
import pi.ms_users.repository.IUserNotificationPreferenceRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.interf.IUserNotificationPreferenceService;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserNotificationPreferenceService implements IUserNotificationPreferenceService {

    private final IUserNotificationPreferenceRepository userNotificationPreferenceRepository;

    private final IUserRepository userRepository;

    @Override
    public ResponseEntity<String> create(UserNotificationPreference userNotificationPreference) {
        try {
            Optional<User> user = Optional.empty();
            try {
                user = userRepository.findById(userNotificationPreference.getUserId());
            } catch (NotFoundException e) {
                return ResponseEntity.notFound().build();
            }

            if (!Arrays.asList(NotificationType.values()).contains(userNotificationPreference.getType())) {
                return ResponseEntity.badRequest().body("Tipo de notificación invalido.");
            }

            List<String> usersIdFalse = userNotificationPreferenceRepository.usersIdByType(userNotificationPreference.getType());
            List<String> usersIdTrue = userNotificationPreferenceRepository.usersIdByTypeTrue(userNotificationPreference.getType());

            if (usersIdFalse.contains(userNotificationPreference.getUserId())) {
                UserNotificationPreference byUser = userNotificationPreferenceRepository.findByUserIdAndType(userNotificationPreference.getUserId(), userNotificationPreference.getType());
                byUser.setEnabled(true);
                userNotificationPreferenceRepository.save(byUser);
            } else if (usersIdTrue.contains(userNotificationPreference.getUserId())) {
                return ResponseEntity.badRequest().body("El usuario ya esta guardado con la preferencia en este tipo de notificacion");
            } else {
                userNotificationPreferenceRepository.save(userNotificationPreference);
            }

            return ResponseEntity.ok("Se ha guardado la preferencia de notificacion");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> update(Long id, Boolean enabled) {
        try {
            Optional<UserNotificationPreference> userNotificationPreference = userNotificationPreferenceRepository.findById(id);
            if (userNotificationPreference.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            UserNotificationPreference preference = userNotificationPreference.get();
            preference.setEnabled(enabled);
            userNotificationPreferenceRepository.save(preference);
            return ResponseEntity.ok("Se ha guardado la preferencia de notificacion");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<UserNotificationPreference> getById(Long id) {
        try {
            Optional<UserNotificationPreference> userNotificationPreference = userNotificationPreferenceRepository.findById(id);
            return userNotificationPreference.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<UserNotificationPreference>> getByUser(String userId) {
        try {
            Optional<User> user = Optional.empty();
            try {
                user = userRepository.findById(userId);
            } catch (NotFoundException e) {
                return ResponseEntity.notFound().build();
            }

            List<UserNotificationPreference> list = userNotificationPreferenceRepository.findByUserId(userId);
            return ResponseEntity.ok(list);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<String>> getByTypeAndTrue(NotificationType type) {
        try {
            List<String> usersId = userNotificationPreferenceRepository.usersIdByTypeTrue(type);
            return ResponseEntity.ok(usersId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
