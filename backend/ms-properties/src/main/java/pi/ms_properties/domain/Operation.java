package pi.ms_properties.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum Operation {
    VENTA,
    ALQUILER;

    public static Operation fromString(String value) {
        try {
            return Operation.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de operacion inválido: " + value
            );
        }
    }
}
