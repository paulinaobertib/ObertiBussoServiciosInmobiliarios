# ── STAGE 1: build (genera keystore y recursos de Quarkus) ────────────────
FROM quay.io/keycloak/keycloak:latest AS builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres

WORKDIR /opt/keycloak

RUN keytool -genkeypair \
    -storetype PKCS12 -storepass password \
    -keyalg RSA -keysize 2048 \
    -alias server \
    -dname "CN=server" \
    -ext "SAN:c=DNS:localhost,IP:127.0.0.1" \
    -keystore conf/server.keystore

RUN /opt/keycloak/bin/kc.sh build

# ── STAGE 2: runtime (más ligero) ────────────────────────────────────────
FROM quay.io/keycloak/keycloak:latest

# 1) copiar build
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# 2) preparar carpeta de H2
USER root
RUN mkdir -p /home/data/h2 && chown -R 1000:1000 /home/data
USER 1000

# 3) exponer HTTP en 8080
EXPOSE 8080

# 4) configuración de entorno para H2 file y admin
ENV KC_DB=dev-file \
    KC_DB_DEV_FILE_DIR=/home/data/h2 \
    KC_BOOTSTRAP_ADMIN_USERNAME=${KEYCLOAK_ADMIN} \
    KC_BOOTSTRAP_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD} \
    KC_HTTP_PORT=8080 \
    KC_HTTPS_ENABLED=false \
    KC_HTTP_ENABLED=true \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_HOSTNAME_STRICT=false

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--http-port=8080", "--http-enabled=true"]
