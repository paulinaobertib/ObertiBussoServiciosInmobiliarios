package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum UtilityPeriodicityPayment {
    UNICO,
    MENSUAL,
    BIMENSUAL,
    TRIMESTRAL,
    SEMESTRAL,
    ANUAL;

    public static UtilityPeriodicityPayment fromString(String value) {
        try {
            return UtilityPeriodicityPayment.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de periodo de pago de la utilidad inválido: " + value
            );
        }
    }
}
