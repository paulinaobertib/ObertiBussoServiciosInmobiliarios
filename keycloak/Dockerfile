
FROM quay.io/keycloak/keycloak:26.2.4

# ────────────────────────── 1) Variables de entorno ──────────────────────────
ENV KC_DB=dev-file \
    KC_DB_FILE_DIR=/home/data/h2 \
    KC_HTTP_PORT=8080 \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_PROXY=edge \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded

# Keycloak escuchará en 8080
EXPOSE 8080

# ─────────────────── 2) Crea la carpeta y asigna permisos ────────────────────
USER root
RUN mkdir -p /home/data/h2 && \
    chown -R 1000:1000 /home/data

# ────────────────────── 3) Vuelve al usuario Keycloak ────────────────────────
USER 1000

# ───────────────────── 4) Arranque de Keycloak (dev-file) ─────────────────────
ENTRYPOINT ["sh","-c", "\
    mkdir -p ${KC_DB_FILE_DIR} && \
    rm -f ${KC_DB_FILE_DIR}/*.lock.db ${KC_DB_FILE_DIR}/DATABASECHANGELOGLOCK* || true && \
    exec /opt/keycloak/bin/kc.sh start-dev \
    --http-port=${KC_HTTP_PORT} \
    --hostname-strict=false \
    --bootstrap-admin-username=${KEYCLOAK_ADMIN} \
    --bootstrap-admin-password=${KEYCLOAK_ADMIN_PASSWORD}"]