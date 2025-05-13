package pi.ms_users.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@EnableMethodSecurity(prePostEnabled = true)
@Configuration
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(new JwtAuthConverter());

        httpSecurity
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/appointments/create").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/appointments/delete/{id}").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/appointments/status/{id}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/appointments/getAll").authenticated()
                        .requestMatchers(HttpMethod.GET, "/appointments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/favorites/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/favorites/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/favorites/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/favorites/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/user/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/user/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/user/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/preference/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/preference/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/preference/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwtConfigurer -> jwtConfigurer
                                .jwtAuthenticationConverter(authenticationConverter))
                );

        return httpSecurity.build();
    }
}
