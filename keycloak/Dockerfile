# ── STAGE 1: build (genera keystore y recursos de Quarkus) ────────────────
FROM quay.io/keycloak/keycloak:latest AS builder

# habilita health & metrics
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# indicamos vendor database para el build
ENV KC_DB=postgres

WORKDIR /opt/keycloak

# generamos un keystore PKCS12 (solo ejemplo; en prod usa tus propios certs)
RUN keytool -genkeypair \
    -storetype PKCS12 -storepass password \
    -keyalg RSA -keysize 2048 \
    -alias server \
    -dname "CN=server" \
    -ext "SAN:c=DNS:localhost,IP:127.0.0.1" \
    -keystore conf/server.keystore

# compile Quarkus/Keycloak con providers, themes, etc.
RUN /opt/keycloak/bin/kc.sh build

# ── STAGE 2: runtime (solo runtime lean) ─────────────────────────────────
FROM quay.io/keycloak/keycloak:latest

# copia todo el /opt/keycloak ya construido
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Expón el puerto que usarás en Azure
EXPOSE 8080

# Variables que Keycloak leerá en runtime (valores concretos desde App Settings)
ENV KC_DB=postgres \
    KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN} \
    KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD} \
    KC_DB_URL=${KC_DB_URL} \
    KC_DB_USERNAME=${KC_DB_USERNAME} \
    KC_DB_PASSWORD=${KC_DB_PASSWORD} \
    KC_HTTP_PORT=8080 \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY=edge \
    KC_PROXY_HEADERS=xforwarded \
    KC_HOSTNAME=${KC_HOSTNAME} \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

# ENTRYPOINT + CMD: kc.sh toma las env vars y arranca optimizado
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized"]