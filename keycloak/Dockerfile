# Imagen multi-stage que compila el runtime optimizado y arranca Keycloak en modo HTTP tras un proxy (App Service).

ARG KEYCLOAK_VERSION=26.1.3

############################################
# ETAPA 1 – Build del runtime optimizado
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

# Habilitamos Postgres + health/metrics durante el build
ENV KC_DB=postgres \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

WORKDIR /opt/keycloak

# Theme personalizado con permisos correctos
COPY --chown=keycloak:root keycloak-theme/inmobiliaria /opt/keycloak/themes/inmobiliaria

# Compila el runtime de Quarkus una sola vez
RUN /opt/keycloak/bin/kc.sh build

############################################
# ETAPA 2 – Imagen final ligera
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}

# Traemos el runtime ya optimizado (incluye el theme)
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Variables por defecto que coinciden con App Service (TLS en el front)
ENV KC_DB=postgres \
    KC_HTTP_PORT=8080 \
    KC_HTTP_ENABLED=true \
    KC_PROXY=edge \
    KC_PROXY_HEADERS=xforwarded \
    KC_HOSTNAME_STRICT=false \
    KC_HOSTNAME_STRICT_HTTPS=false \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

EXPOSE 8080

# Ejecutable y comando por defecto (queda parametrizable vía env vars)
ENTRYPOINT ["/bin/sh","-c","exec /opt/keycloak/bin/kc.sh start --optimized --http-port=$KC_HTTP_PORT --http-enabled=$KC_HTTP_ENABLED --hostname-strict=$KC_HOSTNAME_STRICT --proxy=$KC_PROXY --db-url=$KC_DB_URL --db-username=$KC_DB_USERNAME --db-password=$KC_DB_PASSWORD"]
