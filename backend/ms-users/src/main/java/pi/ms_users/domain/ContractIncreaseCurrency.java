package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum ContractIncreaseCurrency {
    USD,
    ARS;

    public static ContractIncreaseCurrency fromString(String value) {
        try {
            return ContractIncreaseCurrency.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de notificacion inválida: " + value
            );
        }
    }
}
