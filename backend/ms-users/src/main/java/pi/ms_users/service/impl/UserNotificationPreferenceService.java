package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.NotificationType;
import pi.ms_users.domain.UserNotificationPreference;
import pi.ms_users.repository.IUserNotificationPreferenceRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.IUserNotificationPreferenceService;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserNotificationPreferenceService implements IUserNotificationPreferenceService {

    private final IUserNotificationPreferenceRepository userNotificationPreferenceRepository;

    private final IUserRepository userRepository;

    public void deleteUser(String userId) {
        List<UserNotificationPreference> userNotificationPreferences = userNotificationPreferenceRepository.findByUserId(userId);
        userNotificationPreferenceRepository.deleteAll(userNotificationPreferences);
    }

    @Override
    public ResponseEntity<String> create(UserNotificationPreference userNotificationPreference) {
        userRepository.findById(userNotificationPreference.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el usuario"));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !userNotificationPreference.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        if (!Arrays.asList(NotificationType.values()).contains(userNotificationPreference.getType())) {
            throw new IllegalArgumentException("Tipo de notificación inválido.");
        }

        List<String> usersIdFalse = userNotificationPreferenceRepository.usersIdByType(userNotificationPreference.getType());
        List<String> usersIdTrue = userNotificationPreferenceRepository.usersIdByTypeTrue(userNotificationPreference.getType());

        if (usersIdFalse.contains(userNotificationPreference.getUserId())) {
            UserNotificationPreference byUser = userNotificationPreferenceRepository
                    .findByUserIdAndType(userNotificationPreference.getUserId(), userNotificationPreference.getType());
            byUser.setEnabled(true);
            userNotificationPreferenceRepository.save(byUser);
        } else if (usersIdTrue.contains(userNotificationPreference.getUserId())) {
            throw new IllegalArgumentException("El usuario ya está guardado con la preferencia en este tipo de notificación.");
        } else {
            userNotificationPreferenceRepository.save(userNotificationPreference);
        }

        return ResponseEntity.ok("Se ha guardado la preferencia de notificación");
    }

    @Override
    public ResponseEntity<String> update(Long id, Boolean enabled) {
        UserNotificationPreference preference = userNotificationPreferenceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró la preferencia con ID: " + id));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !preference.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        preference.setEnabled(enabled);
        userNotificationPreferenceRepository.save(preference);
        return ResponseEntity.ok("Se ha actualizado la preferencia de notificación");
    }

    @Override
    public ResponseEntity<UserNotificationPreference> getById(Long id) {
        UserNotificationPreference preference = userNotificationPreferenceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró la preferencia con ID: " + id));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !preference.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        return ResponseEntity.ok(preference);
    }

    @Override
    public ResponseEntity<List<UserNotificationPreference>> getByUser(String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el usuario con ID: " + userId));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !userId.equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        List<UserNotificationPreference> list = userNotificationPreferenceRepository.findByUserId(userId);
        return ResponseEntity.ok(list);
    }

    @Override
    public ResponseEntity<List<String>> getByTypeAndTrue(NotificationType type) {
        List<String> usersId = userNotificationPreferenceRepository.usersIdByTypeTrue(type);
        return ResponseEntity.ok(usersId);
    }
}
