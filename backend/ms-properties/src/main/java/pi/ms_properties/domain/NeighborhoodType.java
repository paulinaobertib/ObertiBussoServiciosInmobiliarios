package pi.ms_properties.domain;


import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum NeighborhoodType {
    CERRADO,
    SEMICERRADO,
    ABIERTO;

    public static NeighborhoodType fromString(String value) {
        try {
            return NeighborhoodType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de barrio inválido: " + value
            );
        }
    }
}
