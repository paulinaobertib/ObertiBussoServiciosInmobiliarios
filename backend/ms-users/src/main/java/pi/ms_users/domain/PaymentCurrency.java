package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum PaymentCurrency {
    USD,
    ARS;

    public static PaymentCurrency fromString(String value) {
        try {
            return PaymentCurrency.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de notificacion inválida: " + value
            );
        }
    }
}
