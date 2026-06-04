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
                .build();
    }
}
