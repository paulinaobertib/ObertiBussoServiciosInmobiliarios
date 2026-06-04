package pi.ms_properties.wasi;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WasiClientConfiguration {

    @Bean
    @Qualifier("wasiWebClient")
    public WebClient wasiWebClient(WasiApiProperties props) {
        return WebClient.builder()
                .baseUrl(props.getBaseUrl().replaceAll("/$", ""))
                // Wasi /property/search devuelve cientos de KB (100 props); el default de 256KB
                // tira DataBufferLimitException. Subimos el buffer en memoria a 16MB.
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
    }
}
