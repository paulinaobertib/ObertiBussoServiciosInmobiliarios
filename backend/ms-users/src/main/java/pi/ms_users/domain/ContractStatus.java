package pi.ms_users.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum ContractStatus {
    ACTIVO,
    INACTIVO;

    public static ContractStatus fromString(String value) {
        try {
            return ContractStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de notificacion inválida: " + value
            );
        }
    }
}
