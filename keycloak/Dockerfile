FROM quay.io/keycloak/keycloak:26.2.4 AS builder
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.2.4
COPY --from=builder /opt/keycloak /opt/keycloak

ENV KC_DB=dev-file \
    KC_DB_URL=jdbc:h2:file:/opt/keycloak/data/h2/keycloakdb;MODE=MySQL;DATABASE_TO_UPPER=FALSE;NON_KEYWORDS=VALUE \
    KC_SPI_DBLOCK_PROVIDER=jpa \
    KC_HTTP_PORT=8080 \
    KC_PROXY=edge \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", \
           "--db", "dev-file", \
           "--spi-dblock-provider=jpa", \
           "--import-realm", \
           "--http-enabled=true", \
           "--http-port=8080"]