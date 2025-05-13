package pi.ms_properties.security;

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
                        .requestMatchers(HttpMethod.GET,
                                "/property/get",
                                "/property/getById/**",
                                "/property/getByTitle",
                                "/property/search",
                                "/property/text",
                                "/property/getSimple/**",
                                "/amenity/getAll",
                                "/amenity/getById/**",
                                "/amenity/getByName",
                                "/image/getByProperty/**",
                                "/maintenance/getById/**",
                                "/maintenance/getByPropertyId/**",
                                "/neighborhood/getAll",
                                "/neighborhood/getById/**",
                                "/propertyType/getAll",
                                "/propertyType/getById/**",
                                "/view/statusAndType"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwtConfigurer -> jwtConfigurer
                                .jwtAuthenticationConverter(authenticationConverter))
                );

        return httpSecurity.build();
    }
}

