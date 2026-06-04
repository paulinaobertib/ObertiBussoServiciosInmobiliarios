package pi.ms_gateway.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationFailureHandler;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;


@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http,
                                                         ReactiveClientRegistrationRepository user,
                                                         @Value("${frontend.base-url}") String frontUrl) {

        RedirectServerAuthenticationSuccessHandler loginSuccessHandler =
                new RedirectServerAuthenticationSuccessHandler(frontUrl);

        // Si el login OAuth falla (credenciales mal, estado/sesión vencido, se cancela, etc.) NO
        // mostramos la página default fea de Spring ("Login with OAuth 2.0 / Invalid credentials"):
        // mandamos al usuario de vuelta al sitio (frontend) con un flag.
        RedirectServerAuthenticationFailureHandler loginFailureHandler =
                new RedirectServerAuthenticationFailureHandler(frontUrl + "?loginError=true");

        OidcClientInitiatedServerLogoutSuccessHandler logoutSuccessHandler =
                new OidcClientInitiatedServerLogoutSuccessHandler(user);
        logoutSuccessHandler.setPostLogoutRedirectUri(frontUrl);

        http
                .csrf().disable()
                .authorizeExchange(ex -> ex
                        .pathMatchers("/oidc/logout").authenticated()
                        .anyExchange().permitAll()
                )
                .oauth2Login(o -> o
                        .authenticationSuccessHandler(loginSuccessHandler)
                        .authenticationFailureHandler(loginFailureHandler))
                // Ensure OAuth2 Client support is enabled so authorized client state
                // (access/refresh tokens) is managed and available for TokenRelay
                .oauth2Client()
                .and()
                .logout(l -> l.logoutSuccessHandler(logoutSuccessHandler));

        return http.build();
    }
}
