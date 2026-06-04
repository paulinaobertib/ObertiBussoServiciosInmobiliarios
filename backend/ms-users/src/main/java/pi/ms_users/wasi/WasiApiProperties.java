package pi.ms_users.wasi;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "wasi.api")
public class WasiApiProperties {

    private String baseUrl = "https://api.wasi.co/v1";
    private String idCompany = "";
    private String token = "";

    /** id_client_type para inquilinos al sincronizar User -> Wasi (valor propio de la cuenta, ver /client-type/all). */
    private int idClientTypeTenant = 11;

    public boolean isConfigured() {
        return idCompany != null && !idCompany.isBlank() && token != null && !token.isBlank();
    }
}
