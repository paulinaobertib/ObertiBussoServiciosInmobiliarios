package pi.ms_gateway.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.server.session.CookieWebSessionIdResolver;
import org.springframework.web.server.session.WebSessionIdResolver;

import java.time.Duration;

@Configuration
public class SessionConfig {

    @Bean
    public WebSessionIdResolver webSessionIdResolver(
            @Value("${server.reactive.session.timeout:PT24H}") Duration timeout
    ) {
        CookieWebSessionIdResolver resolver = new CookieWebSessionIdResolver();
        resolver.setCookieName("SESSION");
        // Hace persistente la cookie por el mismo tiempo que la sesión del gateway
        resolver.setCookieMaxAge(timeout);
        // Asegura el envío cross-site desde el frontend (SWA)
        resolver.addCookieInitializer(builder -> builder.sameSite("None"));
        resolver.addCookieInitializer(builder -> builder.secure(true));
        // CHIPS (Partitioned cookies) permiten que la cookie viaje aun con bloqueo de third-party
        resolver.addCookieInitializer(builder -> builder.partitioned(true));
        return resolver;
    }
}
