FROM quay.io/keycloak/keycloak:26.2.4

# Variables de runtime para H2 dev-file
ENV KC_DB=dev-file \
    KC_DB_URL="jdbc:h2:file:/opt/keycloak/data/h2/keycloakdb;MODE=MySQL;DATABASE_TO_UPPER=FALSE;NON_KEYWORDS=VALUE" \
    KC_SPI_DBLOCK_PROVIDER=jpa \
    KC_HTTP_PORT=8080 \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_PROXY=edge

# Asegura la carpeta de datos
RUN mkdir -p /opt/keycloak/data/h2

EXPOSE 8080

# Arranca en modo desarrollo (dev-mode) con JPA lock funcionando sobre H2
ENTRYPOINT ["/opt/keycloak/bin/kc.sh","start-dev", \
    "--spi-dblock-provider=jpa",\
    "--import-realm",\
    "--http-port=8080"]