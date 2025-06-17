package pi.ms_properties.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class SecurityUtils {

    public static String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth instanceof JwtAuthenticationToken token) {
            Jwt jwt = token.getToken();
            return jwt.getSubject();
        }

        return null;
    }

    public static boolean hasRole(String role) {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth instanceof JwtAuthenticationToken token) {
            return token.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
        }

        return false;
    }

    public static boolean isAdmin() {
        return hasRole("admin");
    }

    public static boolean isUser() {
        return hasRole("user");
    }

    public static boolean isTenant() {
        return hasRole("tenant");
    }
}
