package pi.ms_properties.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum InquiryStatus {
    CERRADA,
    ABIERTA;

    public static InquiryStatus fromString(String value) {
        try {
            return InquiryStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de estado de la consulta inválido: " + value
            );
        }
    }
}
