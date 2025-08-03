# ── STAGE 1: build (incluye módulo H2) ───────────────────────────────
FROM quay.io/keycloak/keycloak:latest AS builder

# habilita health & metrics y añade H2 embebida
ENV KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_DB=dev-file \
    KC_DB_DEV_FILE_DIR=/opt/keycloak/data/h2

WORKDIR /opt/keycloak

# genera tu keystore (igual que antes)
RUN keytool -genkeypair \
    -storetype PKCS12 -storepass password \
    -keyalg RSA -keysize 2048 \
    -alias server \
    -dname "CN=server" \
    -ext "SAN:c=DNS:localhost,IP:127.0.0.1" \
    -keystore conf/server.keystore

# compila Quarkus/Keycloak con el provider dev-file
RUN /opt/keycloak/bin/kc.sh build

# ── STAGE 2: runtime (sólo runtime lean) ────────────────────────────
FROM quay.io/keycloak/keycloak:latest

COPY --from=builder /opt/keycloak/ /opt/keycloak/

EXPOSE 8080

# en runtime sólo necesitas señalar dev-file de nuevo (ya está compilado)
ENV KC_DB=dev-file \
    KC_DB_DEV_FILE_DIR=/opt/keycloak/data/h2 \
    KC_HTTP_PORT=8080 \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded \
    KC_METRICS_ENABLED=true \
    KC_HEALTH_ENABLED=true \
    KC_BOOTSTRAP_ADMIN_USERNAME=${KEYCLOAK_ADMIN} \
    KC_BOOTSTRAP_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD} \
    KC_HOSTNAME=${KC_HOSTNAME}

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start","--optimized"]