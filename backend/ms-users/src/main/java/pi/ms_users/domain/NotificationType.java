package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum NotificationType {
    PROPIEDADNUEVA,
    PROPIEDADINTERES;

    public static NotificationType fromString(String value) {
        try {
            return NotificationType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de notificacion inválida: " + value
            );
        }
    }
}
