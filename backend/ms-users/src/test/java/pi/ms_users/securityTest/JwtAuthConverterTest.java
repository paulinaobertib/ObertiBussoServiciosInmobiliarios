package pi.ms_users.securityTest;


import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import pi.ms_users.security.JwtAuthConverter;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class JwtAuthConverterTest {

    private JwtAuthConverter converter;

    @BeforeEach
    void setUp() {
        converter = new JwtAuthConverter();
    }

    @Test
    void convert_withRealmRoles_shouldReturnAuthorities() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("realm_access", Map.of("roles", List.of("ADMIN", "USER")));

        Jwt jwt = buildJwt(claims);

        Collection<GrantedAuthority> authorities = converter.convert(jwt);

        assertEquals(2, authorities.size());
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    }

    @Test
    void convert_withClientRoles_shouldReturnAuthorities() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("resource_access", Map.of(
                "springboot-keycloak-client", Map.of(
                        "roles", List.of("MANAGER", "OPERATOR")
                )
        ));

        Jwt jwt = buildJwt(claims);

        Collection<GrantedAuthority> authorities = converter.convert(jwt);

        assertEquals(2, authorities.size());
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")));
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR")));
    }

    @Test
    void convert_withRealmAndClientRoles_shouldReturnAllAuthorities() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("realm_access", Map.of("roles", List.of("ADMIN")));
        claims.put("resource_access", Map.of(
                "springboot-keycloak-client", Map.of(
                        "roles", List.of("MANAGER")
                )
        ));

        Jwt jwt = buildJwt(claims);

        Collection<GrantedAuthority> authorities = converter.convert(jwt);

        assertEquals(2, authorities.size());
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")));
    }

    @Test
    void convert_withNoRoles_shouldReturnEmptyAuthorities() {
        Map<String, Object> claims = Map.of("dummy", "value");

        Jwt jwt = buildJwt(claims);

        Collection<GrantedAuthority> authorities = converter.convert(jwt);

        assertTrue(authorities.isEmpty());
    }

    private Jwt buildJwt(Map<String, Object> claims) {
        return new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                claims
        );
    }
}
