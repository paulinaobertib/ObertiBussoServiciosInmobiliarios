package pi.ms_gateway.configuration;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebSession;

import reactor.core.publisher.Mono;

/**
 * Wraps a {@link ReactiveOAuth2AuthorizedClientManager} so that, for a given
 * WebSession + client registration, only a single refresh request is executed
 * even if multiple downstream calls detect the expiry at the same time. This
 * avoids triggering multiple refreshes in Keycloak and exceeding the refresh
 * token reuse limit.
 */
public class SessionScopedOAuth2AuthorizedClientManager implements ReactiveOAuth2AuthorizedClientManager {

    private final ReactiveOAuth2AuthorizedClientManager delegate;
    private final ConcurrentMap<String, Mono<OAuth2AuthorizedClient>> inFlight = new ConcurrentHashMap<>();

    public SessionScopedOAuth2AuthorizedClientManager(ReactiveOAuth2AuthorizedClientManager delegate) {
        this.delegate = delegate;
    }

    @Override
    public Mono<OAuth2AuthorizedClient> authorize(OAuth2AuthorizeRequest request) {
        ServerWebExchange exchange = request.getAttribute(ServerWebExchange.class.getName());
        if (exchange == null) {
            return delegate.authorize(request);
        }

        return exchange.getSession()
                .flatMap(session -> authorizeForSession(request, session))
                .switchIfEmpty(delegate.authorize(request));
    }

    private Mono<OAuth2AuthorizedClient> authorizeForSession(OAuth2AuthorizeRequest request, WebSession session) {
        String key = sessionKey(session, request);

        Mono<OAuth2AuthorizedClient> current = inFlight.get(key);
        if (current != null) {
            return current;
        }

        Mono<OAuth2AuthorizedClient> created = delegate.authorize(request)
                .doFinally(signalType -> inFlight.remove(key))
                .cache();

        Mono<OAuth2AuthorizedClient> existing = inFlight.putIfAbsent(key, created);
        if (existing != null) {
            return existing;
        }
        return created;
    }

    private static String sessionKey(WebSession session, OAuth2AuthorizeRequest request) {
        String registrationId = registrationId(request);
        if (registrationId == null) {
            registrationId = "default";
        }
        return session.getId() + ':' + registrationId;
    }

    private static String registrationId(OAuth2AuthorizeRequest request) {
        return request.getClientRegistrationId();
    }
}
