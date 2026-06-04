package pi.ms_properties.wasi;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "wasi.defaults")
public class WasiDefaultsProperties {

    private int countryId = 5;
    private int regionId = 14;

    /** id_property_type usado cuando el nombre del tipo local no matchea ninguna regla (1 = Casa). */
    private int propertyTypeDefaultId = 1;

    /** id_client_type para propietarios al sincronizar Owner -> Wasi (valor propio de la cuenta). */
    private int clientTypeOwner = 5;

    /** id_currency de Wasi para USD (valor propio de la cuenta, ver /currency/all). */
    private int currencyUsd = 3;

    /** id_currency de Wasi para ARS / moneda por defecto (valor propio de la cuenta). */
    private int currencyArs = 2;
}
