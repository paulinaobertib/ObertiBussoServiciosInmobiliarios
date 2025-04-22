package pi.ms_properties.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum Currency {
    USD,
    ARG;

    public static Currency fromString(String value) {
        try {
            return Currency.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de cambio inválido: " + value
            );
        }
    }
}
