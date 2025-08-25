package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum PaymentConcept {
    ALQUILER,
    EXTRA,
    COMISION;

    public static PaymentConcept fromString(String value) {
        try {
            return PaymentConcept.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de concepto de pago inválido: " + value
            );
        }
    }
}
