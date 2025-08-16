package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum CommissionPaymentType {
    COMPLETO,
    CUOTAS;

    public static CommissionPaymentType fromString(String value) {
        try {
            return CommissionPaymentType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de pago de comision inválido: " + value
            );
        }
    }
}
