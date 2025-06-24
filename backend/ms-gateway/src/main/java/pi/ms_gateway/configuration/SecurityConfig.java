package pi.ms_gateway.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.logout.RedirectServerLogoutSuccessHandler;

import java.net.URI;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;

@Configuration
public class SecurityConfig {

//     @Bean
//     public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http,
//                                                          @Value("${frontend.base-url}") String frontUrl) {

//         var successHandler = new RedirectServerAuthenticationSuccessHandler();
//         successHandler.setLocation(URI.create(frontUrl));

//         var logoutHandler = new RedirectServerLogoutSuccessHandler();
//         logoutHandler.setLogoutSuccessUrl(URI.create(frontUrl));

//         http.authorizeExchange(ex -> ex.anyExchange().permitAll())
//                 .oauth2Login(o -> o.authenticationSuccessHandler(successHandler))
//                 .logout(l -> l.logoutSuccessHandler(logoutHandler));

//         return http.build();
//     }
  @Bean
  public SecurityWebFilterChain securityWebFilterChain(
        ServerHttpSecurity http,
        ReactiveClientRegistrationRepository clients,
        @Value("${frontend.base-url}") String frontUrl) {

    // ── 1) Login: tras autenticar, redirige al front ──
    var loginSuccess = new RedirectServerAuthenticationSuccessHandler();
    loginSuccess.setLocation(URI.create(frontUrl));

    // ── 2) Logout OIDC: invalida Keycloak SSO y redirige al front ──
    var oidcLogout = new OidcClientInitiatedServerLogoutSuccessHandler(clients);
    oidcLogout.setPostLogoutRedirectUri(frontUrl);

    http
      .cors().and()
      .csrf().disable()

      // a) autorización abierta (ajusta según tu necesidad)
      .authorizeExchange(ex -> ex.anyExchange().permitAll())

      // b) OIDC Login + repositorio (TokenRelay)
      .oauth2Login(o -> o.authenticationSuccessHandler(loginSuccess))
      .oauth2Client().and()

      // c) Logout: GET /logout → confirmación; POST /logout → aquí
      .logout(l -> l.logoutSuccessHandler(oidcLogout));

    return http.build();
  }
}
