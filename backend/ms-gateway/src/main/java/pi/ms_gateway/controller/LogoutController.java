package pi.ms_gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.net.URI;

@RestController
public class LogoutController {

    @Value("${spring.security.oauth2.client.provider.keycloak-client.issuer-uri}")
    private String issuerUri;

    @Value("${frontend.base-url:/}")
    private String frontBaseUrl;

    @GetMapping("/oidc/logout")
    public Mono<ResponseEntity<Void>> logout(@AuthenticationPrincipal OidcUser user,
                                             ServerWebExchange exchange) {
        final String postLogout = ensureSlash(frontBaseUrl);
        final String redirectTo;
        if (user != null && user.getIdToken() != null) {
            String end = issuerUri.endsWith("/")
                    ? issuerUri + "protocol/openid-connect/logout"
                    : issuerUri + "/protocol/openid-connect/logout";
            redirectTo = UriComponentsBuilder.fromUriString(end)
                    .queryParam("id_token_hint", user.getIdToken().getTokenValue())
                    .queryParam("post_logout_redirect_uri", postLogout)
                    .build(true)
                    .toUriString();
        } else {
            redirectTo = postLogout;
        }

        return exchange.getSession()
                .flatMap(ws -> ws.invalidate())
                .then(Mono.just(ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(redirectTo))
                        .build()));
    }

    private static String ensureSlash(String url) {
        return url != null && url.endsWith("/") ? url : (url == null ? "/" : url + "/");
    }
}
