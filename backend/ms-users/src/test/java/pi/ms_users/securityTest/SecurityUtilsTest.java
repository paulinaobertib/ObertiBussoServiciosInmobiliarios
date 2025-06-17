package pi.ms_users.securityTest;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import pi.ms_users.security.SecurityUtils;

import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class SecurityUtilsTest {

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getCurrentUserId_shouldReturnSubjectFromJwt() {
        Jwt jwt = Jwt.withTokenValue("token")
                .subject("user123")
                .header("alg", "none")
                .claim("scope", "user")
                .build();

        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        String userId = SecurityUtils.getCurrentUserId();
        assertEquals("user123", userId);
    }

    @Test
    void getCurrentUserId_shouldReturnNull_whenNotJwtToken() {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("user", "pass");
        SecurityContextHolder.getContext().setAuthentication(auth);

        String userId = SecurityUtils.getCurrentUserId();
        assertNull(userId);
    }

    @Test
    void hasRole_shouldReturnTrue_whenRolePresent() {
        Jwt jwt = Jwt.withTokenValue("token")
                .subject("user123")
                .header("alg", "none")
                .build();

        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt,
                List.of(new SimpleGrantedAuthority("ROLE_admin")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertTrue(SecurityUtils.hasRole("admin"));
    }

    @Test
    void hasRole_shouldReturnFalse_whenRoleNotPresent() {
        Jwt jwt = Jwt.withTokenValue("token")
                .subject("user123")
                .header("alg", "none")
                .build();

        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt,
                List.of(new SimpleGrantedAuthority("ROLE_user")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertFalse(SecurityUtils.hasRole("admin"));
    }

    @Test
    void isAdmin_shouldReturnTrue_whenAdminRolePresent() {
        setAuthWithRoles("ROLE_admin");
        assertTrue(SecurityUtils.isAdmin());
    }

    @Test
    void isUser_shouldReturnTrue_whenUserRolePresent() {
        setAuthWithRoles("ROLE_user");
        assertTrue(SecurityUtils.isUser());
    }

    @Test
    void isTenant_shouldReturnTrue_whenTenantRolePresent() {
        setAuthWithRoles("ROLE_tenant");
        assertTrue(SecurityUtils.isTenant());
    }

    private void setAuthWithRoles(String... roles) {
        Jwt jwt = Jwt.withTokenValue("token")
                .subject("user123")
                .header("alg", "none")
                .build();

        List<SimpleGrantedAuthority> authorities =
                Stream.of(roles).map(SimpleGrantedAuthority::new).toList();

        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}

