# ── STAGE 1: build (genera keystore y recursos de Quarkus) ────────────────
FROM quay.io/keycloak/keycloak:latest AS builder

# habilita health & metrics
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# indicamos vendor database para el build (no afecta luego)
ENV KC_DB=dev-file
ENV KC_DB_FILE_DIR=/home/data/h2

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

# 1) copia los artefactos ya construidos
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# 2) creamos la carpeta persistente para H2 y fijamos permisos
USER root
RUN mkdir -p /home/data/h2 \
    && chown -R 1000:1000 /home/data

# 3) volvemos al usuario de Keycloak (UID 1000)
USER 1000

# 4) exponemos el puerto que usará Keycloak
EXPOSE 8080

# 5) configuramos Keycloak para usar H2 en modo "file"
ENV KC_DB=dev-file \
    KC_DB_DEV_FILE_DIR=/home/data/h2 \
    KC_BOOTSTRAP_ADMIN_USERNAME=${KEYCLOAK_ADMIN} \
    KC_BOOTSTRAP_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD} \
    KC_HTTP_PORT=8080 \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY=edge \
    KC_PROXY_HEADERS=xforwarded \
    KC_HOSTNAME=${KC_HOSTNAME} \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

# 6) ENTRYPOINT y CMD estándar
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--http-enabled=true", "--http-port=8080", "--https-port=-1", "--hostname-strict=false", "--proxy=edge"]