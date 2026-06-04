package pi.ms_properties.domain;

import lombok.Getter;

@Getter
public enum PropertyCondition {
    NUEVA(1),
    USADA(2),
    EN_PROYECTO(3),
    EN_CONSTRUCCION(4);

    private final int wasiId;

    PropertyCondition(int wasiId) {
        this.wasiId = wasiId;
    }

    public static PropertyCondition fromWasiId(int id) {
        for (PropertyCondition c : values()) {
            if (c.wasiId == id) {
                return c;
            }
        }
        return USADA;
    }
}
