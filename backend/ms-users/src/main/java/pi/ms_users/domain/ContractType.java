package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum ContractType {
    TEMPORAL,
    VIVIENDA,
    COMERCIAL;

    public static ContractType fromString(String value) {
        try {
            return ContractType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de notificacion inválida: " + value
            );
        }
    }
}
