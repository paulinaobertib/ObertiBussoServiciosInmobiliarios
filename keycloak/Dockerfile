ARG KEYCLOAK_VERSION=26.1.3

############################################
# ETAPA 1 – Build del runtime optimizado
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS builder

# Build-time options para incluir driver Postgres, health y métricas
ENV KC_DB=postgres \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

WORKDIR /opt/keycloak

COPY keycloak-theme/inmobiliaria /opt/keycloak/themes/inmobiliaria

# Compila una vez el runtime Quarkus
RUN /opt/keycloak/bin/kc.sh build

############################################
# ETAPA 2 – Imagen final ligera
############################################
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Valores por defecto que coinciden con App Settings
ENV KC_DB=postgres \
    KC_HTTP_PORT=8080 \
    KC_HTTP_ENABLED=true \
    KC_PROXY=edge \
    KC_PROXY_HEADERS=xforwarded \
    KC_HOSTNAME_STRICT=false

EXPOSE 8080

ENTRYPOINT ["/bin/sh","-c","exec /opt/keycloak/bin/kc.sh start --optimized --http-port=$KC_HTTP_PORT --db-url=$KC_DB_URL --db-username=$KC_DB_USERNAME --db-password=$KC_DB_PASSWORD"]