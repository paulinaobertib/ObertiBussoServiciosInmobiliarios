package pi.ms_properties.feign.configuration;

import feign.RequestTemplate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import pi.ms_properties.configuration.feign.FeignInterceptor;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FeignInterceptorTest {

    private final FeignInterceptor interceptor = new FeignInterceptor();

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void apply_shouldAddAuthorizationHeader_whenJwtTokenPresent() {
        Jwt jwt = Jwt.withTokenValue("fake-token").header("alg", "none").claim("sub", "user").build();
        JwtAuthenticationToken authentication = new JwtAuthenticationToken(jwt);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        RequestTemplate template = new RequestTemplate();

        interceptor.apply(template);

        List<String> header = (List<String>) template.headers().get("Authorization");
        assertNotNull(header);
        assertEquals("Bearer fake-token", header.get(0));
    }

    @Test
    void apply_shouldNotAddAuthorizationHeader_whenNoAuthentication() {
        RequestTemplate template = new RequestTemplate();

        interceptor.apply(template);

        assertFalse(template.headers().containsKey("Authorization"));
    }

    @Test
    void apply_shouldNotAddAuthorizationHeader_whenAuthenticationIsNotJwt() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user", "pass")
        );

        RequestTemplate template = new RequestTemplate();

        interceptor.apply(template);

        assertFalse(template.headers().containsKey("Authorization"));
    }
}