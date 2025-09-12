package pi.ms_users.configuration.components;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class AppProperties {

    private final String frontendBaseUrl;

    private final String emailInmobiliaria;

    public AppProperties(@Value("${frontend.base-url}") String frontendBaseUrl, @Value("${email.username}") String emailInmobiliaria) {
        this.frontendBaseUrl = frontendBaseUrl;
        this.emailInmobiliaria = emailInmobiliaria;
    }
}
