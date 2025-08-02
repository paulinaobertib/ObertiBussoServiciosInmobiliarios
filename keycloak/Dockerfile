FROM quay.io/keycloak/keycloak:26.2.4

# ─── 1) VARIABLES DE ENTORNO PARA H2 EN MODO "file" ───────────────────────────
#    KC_DB_FILE_DIR: carpeta dentro de /home (persistente en App Service)
ENV KC_DB=dev-file \
    KC_DB_FILE_DIR=/home/data/h2 \
    KC_HTTP_PORT=8080 \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_PROXY=edge \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded

# Exponemos el puerto que Keycloak usará
EXPOSE 8080

# ─── 2) CREAR LA CARPETA PERSISTENTE Y AJUSTAR PERMISOS ────────────────────────
# Keycloak corre como usuario 1000, así que la carpeta /home/data/h2 debe ser
# propiedad de ese usuario para que pueda escribir los archivos H2 sin problemas.
USER root
RUN mkdir -p /home/data/h2 && chown -R 1000:1000 /home/data

# ─── 3) VOLVEMOS AL USUARIO DE KEYCLOAK (UID 1000) ─────────────────────────────
USER 1000

# ─── 4) ENTRY POINT ORIGINAL, PERO APUNTA A /home/data/h2 EN LUGAR DE /opt/... ──
ENTRYPOINT ["sh","-c", "\
  mkdir -p /home/data/h2 && \
  rm -f /home/data/h2/*.lock.db /home/data/h2/DATABASECHANGELOGLOCK* || true && \
  exec /opt/keycloak/bin/kc.sh start-dev \
       --http-port=${KC_HTTP_PORT} \
       --hostname-strict=false \
       --bootstrap-admin-username=${KEYCLOAK_ADMIN} \
       --bootstrap-admin-password=${KEYCLOAK_ADMIN_PASSWORD}"]