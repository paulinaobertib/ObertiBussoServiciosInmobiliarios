FROM quay.io/keycloak/keycloak:26.2.4

RUN mkdir -p /opt/keycloak/data/h2

ENV KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_HTTP_PORT=8080 \
    KC_PROXY=edge \
    KC_DB=dev-file \
    KC_SPI_DBLOCK_DEFAULT=noop \
    KC_CACHE=local \
    KC_DB_URL=jdbc:h2:file:/opt/keycloak/data/h2/keycloakdb;MODE=MySQL;DATABASE_TO_UPPER=FALSE;NON_KEYWORDS=VALUE

EXPOSE 8080
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm", "--http-port=8080"]