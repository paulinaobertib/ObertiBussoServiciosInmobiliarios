package pi.ms_properties.wasi;

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
    /** Wasi id_user (agent) for new properties */
    private Integer defaultUserId = 1;
    private int cacheTtlMinutes = 5;

    public boolean isConfigured() {
        return idCompany != null && !idCompany.isBlank() && token != null && !token.isBlank();
    }
}
