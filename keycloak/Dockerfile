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

# 1) Arrancamos como root para modificar DNS
USER root

# 2) Sobrescribimos resolv.conf con servidores públicos que sí resuelven tu host
RUN printf "nameserver 1.1.1.1\nnameserver 8.8.8.8\n" > /etc/resolv.conf

# 3) Volvemos al usuario de Keycloak y copiamos artefactos
USER 1000
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# 4) Exponemos puerto y definimos variables
EXPOSE 8080
ENV KC_DB=postgres \
    KC_DB_URL="${KC_DB_URL}?sslmode=require&sslfactory=org.postgresql.ssl.NonValidatingFactory" \
    KC_DB_USERNAME="${KC_DB_USERNAME}" \
    KC_DB_PASSWORD="${KC_DB_PASSWORD}" \
    KC_BOOTSTRAP_ADMIN_USERNAME="${KEYCLOAK_ADMIN}" \
    KC_BOOTSTRAP_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD}" \
    KC_HTTP_PORT=8080 \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY=edge \
    KC_PROXY_HEADERS=xforwarded \
    KC_HOSTNAME="${KC_HOSTNAME}" \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start","--optimized"]