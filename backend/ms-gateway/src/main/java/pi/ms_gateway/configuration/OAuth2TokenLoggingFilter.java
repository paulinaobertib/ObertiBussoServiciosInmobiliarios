package pi.ms_gateway.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;

/**
 * Logs (masked) access/refresh tokens when they change, for debugging purposes only.
 */
@Component
public class OAuth2TokenLoggingFilter implements WebFilter {
    private static final Logger log = LoggerFactory.getLogger(OAuth2TokenLoggingFilter.class);

    private final ServerOAuth2AuthorizedClientRepository clientRepository;
    private final boolean enabled;

    public OAuth2TokenLoggingFilter(ServerOAuth2AuthorizedClientRepository clientRepository,
                                    @Value("${security.oauth2.client.log-tokens:false}") boolean enabled) {
        this.clientRepository = clientRepository;
        this.enabled = enabled;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        if (!enabled) {
            return chain.filter(exchange);
        }
        // Run after the rest of the chain so we observe updated tokens
        return chain.filter(exchange).then(Mono.defer(() ->
                exchange.getPrincipal()
                        .cast(Authentication.class)
                        .filter(auth -> auth instanceof OAuth2AuthenticationToken)
                        .flatMap(auth -> {
                            String regId = ((OAuth2AuthenticationToken) auth).getAuthorizedClientRegistrationId();
                            return clientRepository.loadAuthorizedClient(regId, auth, exchange)
                                    .flatMap(authorizedClient -> logIfChanged(exchange, authorizedClient));
                        })
                        .onErrorResume(ex -> Mono.empty())
                        .then()
        ));
    }

    private Mono<Void> logIfChanged(ServerWebExchange exchange, OAuth2AuthorizedClient client) {
        OAuth2RefreshToken refresh = client.getRefreshToken();
        if (refresh == null) return Mono.empty();

        String currentRefresh = refresh.getTokenValue();
        String currentHash = sha256(currentRefresh);
        String sessionKey = "oauth2.lastRefreshHash." + client.getClientRegistration().getRegistrationId();

        return exchange.getSession().flatMap(session -> {
            String previousHash = (String) session.getAttributes().get(sessionKey);
            if (!currentHash.equals(previousHash)) {
                session.getAttributes().put(sessionKey, currentHash);
                // Mask tokens for logs
                String maskedRefresh = mask(currentRefresh);
                OAuth2AccessToken at = client.getAccessToken();
                String maskedAccess = at != null ? mask(at.getTokenValue()) : "<none>";
                Instant exp = at != null ? at.getExpiresAt() : null;
                log.info("[OAuth2] Tokens updated for client='{}' user='{}' access='{}' expiresAt='{}' refresh='{}'",
                        client.getClientRegistration().getRegistrationId(),
                        client.getPrincipalName(),
                        maskedAccess,
                        exp,
                        maskedRefresh);
            }
            return Mono.empty();
        });
    }

    private static String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(value.hashCode());
        }
    }

    private static String mask(String token) {
        if (token == null) return "<null>";
        int len = token.length();
        int prefix = Math.min(6, len);
        int suffix = Math.min(4, Math.max(0, len - prefix));
        String start = token.substring(0, prefix);
        String end = token.substring(len - suffix);
        return start + "…" + end + "(" + len + ")";
    }
}

