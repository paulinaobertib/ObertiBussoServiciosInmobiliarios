package pi.ms_properties.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class JwtAuthConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt source) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        // roles del reino
        Map<String, Object> realmRolesAccess = source.getClaim("realm_access");

        if (realmRolesAccess != null && !realmRolesAccess.isEmpty()) {
            authorities.addAll(extractRoles(realmRolesAccess));
        }

        // roles del cliente
        Map<String, Object> resourceAccess = source.getClaim("resource_access");
        Map<String, Object> resource;
        Collection<String> resourceRoles;

        if (resourceAccess != null && (resource = (Map<String, Object>) resourceAccess.get("springboot-keycloak-client")) != null && (resourceRoles = (Collection<String>) resource.get("roles")) != null) {
            authorities.addAll(extractClientRoles(resourceRoles));
        }

        return authorities;
    }

    // roles del reino
    private static Collection<GrantedAuthority> extractRoles(Map<String, Object> realmRolesAccess) {
        return ((List<String>) realmRolesAccess.get("roles"))
                .stream().map(roleMap -> "ROLE_" + roleMap)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    // roles del cliente
    private static Collection<GrantedAuthority> extractClientRoles(Collection<String> resourceRoles) {
        return resourceRoles
                .stream()
                .map(roleMap -> new SimpleGrantedAuthority("ROLE_" + roleMap))
                .collect(Collectors.toList());
    }
}
