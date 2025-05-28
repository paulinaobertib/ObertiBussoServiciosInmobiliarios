# 1) Build-time: compila la plataforma Quarkus/Keycloak
FROM quay.io/keycloak/keycloak:26.2.4 AS builder
RUN /opt/keycloak/bin/kc.sh build

# 2) Runtime: copia el resultado y arranca en modo “start” (no dev)
FROM quay.io/keycloak/keycloak:26.2.4
COPY --from=builder /opt/keycloak /opt/keycloak

# 3) Variables por defecto (puedes omitir las de admin, se inyectan en el pipeline)
ENV KC_DB=dev-file \
    KC_DB_URL=jdbc:h2:file:/opt/keycloak/data/h2/keycloakdb;MODE=MySQL;DATABASE_TO_UPPER=FALSE;NON_KEYWORDS=VALUE \
    KC_SPI_DBLOCK_PROVIDER=jpa \
    KC_HTTP_PORT=8080 \
    KC_PROXY=edge \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

EXPOSE 8080

# 4) ENTRYPOINT en modo “start” con JPA lock provider
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", \
           "--db", "dev-file", \
           "--spi-dblock-provider=jpa", \
           "--import-realm", \
           "--http-port=8080"]