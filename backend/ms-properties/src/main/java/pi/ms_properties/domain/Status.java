package pi.ms_properties.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum Status {
    DISPONIBLE,
    VENDIDA,
    ALQUILADA,
    RESERVADA,
    ESPERA,
    INACTIVA;

    public static Status fromString(String value) {
        try {
            return Status.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de estado inválido: " + value
            );
        }
    }
}
