package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum CommissionStatus {
    PENDIENTE,
    PARCIAL,
    PAGADA;

    public static CommissionStatus fromString(String value) {
        try {
            return CommissionStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de estado de comision inválido: " + value
            );
        }
    }
}
