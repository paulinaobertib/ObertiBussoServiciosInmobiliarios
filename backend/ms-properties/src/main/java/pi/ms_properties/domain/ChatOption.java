package pi.ms_properties.domain;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum ChatOption {
    VER_PRECIO,
    VER_HABITACIONES,
    VER_AREA,
    VER_UBICACION,
    VER_CARACTERISTICAS,
    VER_OPERACION,
    VER_CREDITO,
    VER_FINANCIACION,
    DERIVAR,
    CERRAR;

    public static ChatOption fromString(String value) {
        try {
            return ChatOption.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Opcion invalida: " + value
            );
        }
    }
}
