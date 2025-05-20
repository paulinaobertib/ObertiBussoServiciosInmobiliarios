package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum AppointmentStatus {
    ACEPTADO,
    RECHAZADO,
    ESPERA;

    public static AppointmentStatus fromString(String value) {
        try {
            return AppointmentStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de estado del turno inválido: " + value
            );
        }
    }
}
