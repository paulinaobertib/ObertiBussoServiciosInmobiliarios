FROM quay.io/keycloak/keycloak:26.3.2 AS builder 

# Módulo H2 + health/metrics; la BD vivirá luego en /home/data/h2
ENV KC_METRICS_ENABLED=true \
    KC_HEALTH_ENABLED=true  \
    KC_DB=dev-file          \
    KC_DB_FILE_DIR=/home/data/h2

WORKDIR /opt/keycloak
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.3.2

# Copiamos lo ya compilado
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# ─────────────── variables de entorno por defecto ────────────────
ENV KC_DB=dev-file \
    KC_DB_FILE_DIR=/home/data/h2 \
    KC_HTTP_PORT=8080 \
    KC_HTTPS_PORT=-1 \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded \
    KC_METRICS_ENABLED=true \
    KC_HEALTH_ENABLED=true

# ─────────── carpeta persistente + permisos (UID 1000) ───────────
USER root
RUN mkdir -p /home/data/h2 && \
    chown -R 1000:1000 /home/data
USER 1000

EXPOSE 8080

# ────────────── ENTRYPOINT: borra solo locks, nunca la BD ─────────
ENTRYPOINT ["sh","-c", "\
  mkdir -p ${KC_DB_FILE_DIR} && \
  rm -f  ${KC_DB_FILE_DIR}/*.lock.db ${KC_DB_FILE_DIR}/DATABASECHANGELOGLOCK* || true && \
  exec /opt/keycloak/bin/kc.sh start \
       --db=dev-file \
       --optimized \
       --http-port=${KC_HTTP_PORT} \
       --https-port=${KC_HTTPS_PORT}"]

######################################################################
# Nada más: las credenciales de admin, hostname, etc. las inyecta
# App Service como “App Settings”; NO se expanden en build-time.
######################################################################
