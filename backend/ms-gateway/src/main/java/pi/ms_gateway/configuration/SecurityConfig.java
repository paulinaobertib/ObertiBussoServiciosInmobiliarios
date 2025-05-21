package pi.ms_gateway.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
            .cors().and()
            .csrf().disable()
            .authorizeExchange(ex -> ex.anyExchange().permitAll())
            .build();          // sin oauth2Login, sin resource-server
    }
}
