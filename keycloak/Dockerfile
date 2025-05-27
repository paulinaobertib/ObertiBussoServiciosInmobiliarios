FROM quay.io/keycloak/keycloak:26.2.4

# Creamos carpeta para H2 si usas dev-file
RUN mkdir -p /opt/keycloak/data/h2

# Variables de configuración
ENV KC_DB=dev-file \
    KC_DB_URL=jdbc:h2:file:/opt/keycloak/data/h2/keycloakdb;MODE=MySQL;DATABASE_TO_UPPER=FALSE \
    KC_SPI_DBLOCK_PROVIDER=jpa \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_HTTP_PORT=8080 \
    KC_PROXY=edge

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm", "--http-port=8080"]