package pi.ms_gateway.configuration;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.logout.RedirectServerLogoutSuccessHandler;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http,
                                                         @Value("${frontend.base-url}") String frontUrl) {

        var successHandler = new RedirectServerAuthenticationSuccessHandler();
        successHandler.setLocation(URI.create(frontUrl)); 

        var logoutHandler = new RedirectServerLogoutSuccessHandler();
        logoutHandler.setLogoutSuccessUrl(URI.create(frontUrl));

        http.authorizeExchange(ex -> ex.anyExchange().permitAll())
            .oauth2Login(o -> o.authenticationSuccessHandler(successHandler))
            .logout(l -> l.logoutSuccessHandler(logoutHandler));

        return http.build();
    }
}