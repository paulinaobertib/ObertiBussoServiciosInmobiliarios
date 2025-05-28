# 1) Builder: creamos la imagen optimizada con los build-time settings
FROM quay.io/keycloak/keycloak:latest AS builder

# Habilitamos health, metrics y configuramos el provider de bloqueo a JPA (dblock)
ENV KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_DB=dev-file \
    KC_SPI_DBLOCK_PROVIDER=jpa

# Ejecutamos el build optimizado (incluye DB, lock-provider, health y metrics)
RUN /opt/keycloak/bin/kc.sh build

# 2) Runtime: partimos de la misma base y copiamos la build optimizada
FROM quay.io/keycloak/keycloak:latest
COPY --from=builder /opt/keycloak /opt/keycloak

# 3) Runtime vars: URL de H2 apuntando al directorio montado
ENV KC_DB_URL="jdbc:h2:file:/opt/keycloak/data/h2/keycloakdb;MODE=MySQL;DATABASE_TO_UPPER=FALSE;NON_KEYWORDS=VALUE" \
    KC_HTTP_ENABLED=true \
    KC_HTTP_PORT=8080 \
    KC_PROXY=edge

EXPOSE 8080

# 4) ENTRYPOINT en modo producción optimizado, HTTP plano
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", \
    "--import-realm", \
    "--http-enabled=true", \
    "--http-port=8080", \ 
    "--optimized"]