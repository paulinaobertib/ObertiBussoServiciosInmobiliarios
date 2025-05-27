FROM quay.io/keycloak/keycloak:26.2.4

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_HTTP_ENABLED=true
ENV KC_HTTP_PORT=8080
ENV QUARKUS_HTTP_PORT=8080

ENV KC_PROXY=edge
ENV KC_HOSTNAME_STRICT=false
ENV KC_PROXY_HEADERS=xforwarded

ENV KC_DB=dev-file
ENV KC_DB_URL=jdbc:h2:/opt/keycloak/data/h2/keycloakdb


VOLUME ["/opt/keycloak/data", "/opt/keycloak/data/import"]

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--http-port=8080"]