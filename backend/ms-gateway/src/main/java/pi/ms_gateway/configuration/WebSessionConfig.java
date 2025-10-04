package pi.ms_gateway.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.server.session.CookieWebSessionIdResolver;
import org.springframework.web.server.session.WebSessionIdResolver;

@Configuration
public class WebSessionConfig {

    @Bean
    public WebSessionIdResolver webSessionIdResolver() {
        CookieWebSessionIdResolver resolver = new CookieWebSessionIdResolver();
        // Fuerza la cookie de sesión ("SESSION") con SameSite=None y Secure en producción (HTTPS)
        resolver.addCookieInitializer(builder -> builder.sameSite("None"));
        resolver.addCookieInitializer(builder -> builder.secure(true));
        return resolver;
    }
}

