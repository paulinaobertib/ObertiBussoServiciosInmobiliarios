package pi.ms_properties.domain;

import lombok.Getter;

@Getter
public enum RentsType {
    DIARIO(1),
    SEMANAL(2),
    QUINCENAL(3),
    MENSUAL(4);

    private final int wasiId;

    RentsType(int wasiId) {
        this.wasiId = wasiId;
    }

    public static RentsType fromWasiId(int id) {
        for (RentsType r : values()) {
            if (r.wasiId == id) {
                return r;
            }
        }
        return MENSUAL;
    }
}
