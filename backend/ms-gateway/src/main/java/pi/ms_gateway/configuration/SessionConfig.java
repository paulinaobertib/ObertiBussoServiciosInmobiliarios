package pi.ms_gateway.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.server.session.CookieWebSessionIdResolver;
import org.springframework.web.server.session.WebSessionIdResolver;

import java.time.Duration;

@Configuration
public class SessionConfig {

    @Bean
    public WebSessionIdResolver webSessionIdResolver(
            @Value("${server.reactive.session.timeout:PT24H}") Duration timeout,
            @Value("${server.reactive.session.cookie.same-site:None}") String sameSite,
            @Value("${server.reactive.session.cookie.secure:false}") boolean secure,
            @Value("${server.reactive.session.cookie.partitioned:false}") boolean partitioned
    ) {
        CookieWebSessionIdResolver resolver = new CookieWebSessionIdResolver();
        resolver.setCookieName("SESSION");
        // Hace persistente la cookie por el mismo tiempo que la sesión del gateway
        resolver.setCookieMaxAge(timeout);
        String normalizedSameSite = normalizeSameSite(sameSite);
        resolver.addCookieInitializer(builder -> {
            if (normalizedSameSite != null) {
                builder.sameSite(normalizedSameSite);
            }
            builder.secure(secure);
            if (partitioned) {
                builder.partitioned(true);
            }
        });
        return resolver;
    }

    private static String normalizeSameSite(String rawValue) {
        if (!StringUtils.hasText(rawValue)) {
            return null;
        }
        String trimmed = rawValue.trim();
        if ("none".equalsIgnoreCase(trimmed)) {
            return "None";
        }
        if ("lax".equalsIgnoreCase(trimmed)) {
            return "Lax";
        }
        if ("strict".equalsIgnoreCase(trimmed)) {
            return "Strict";
        }
        return trimmed;
    }
}
