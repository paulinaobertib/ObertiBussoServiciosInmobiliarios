# Dockerfile (colócalo en keycloak/Dockerfile)
FROM quay.io/keycloak/keycloak:26.2.4 AS builder
# 1) Genera la aplicación optimizada
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.2.4
# 2) Copia la build optimizada
COPY --from=builder /opt/keycloak /opt/keycloak

# 3) Variables mínimas
ENV KC_DB=dev-file \
    KC_DB_URL=jdbc:h2:file:/opt/keycloak/data/h2/keycloakdb;MODE=MySQL;DATABASE_TO_UPPER=FALSE;NON_KEYWORDS=VALUE \
    KC_SPI_DBLOCK_PROVIDER=jpa \
    KC_HTTP_ENABLED=true \
    KC_HTTP_PORT=8080 \
    KC_PROXY=edge \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

EXPOSE 8080

# 4) Arranque en modo producción optimizado y HTTP plano
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", \
    # "--db", "dev-file", \
    "--spi-dblock-provider=jpa", \
    "--import-realm", \
    "--http-enabled=true", \
    "--http-port=8080", \
    "--optimized"]