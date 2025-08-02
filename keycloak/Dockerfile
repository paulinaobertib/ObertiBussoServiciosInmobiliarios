FROM quay.io/keycloak/keycloak:26.2.4

# ─── 1) VARIABLES DE ENTORNO PARA H2 EN MODO "file" ───────────────────────────
#    KC_DB_FILE_DIR: carpeta dentro de /home (persistente en App Service)
ENV KC_DB=postgres \
    KC_DB_URL=${KC_DB_URL} \
    KC_DB_USERNAME=${KC_DB_USERNAME} \
    KC_DB_PASSWORD=${KC_DB_PASSWORD} \
    # Administración -------------------------------------------------------------
    KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN} \
    KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD} \
    # HTTP / proxy ---------------------------------------------------------------
    KC_HTTP_PORT=8080 \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY=edge \
    KC_PROXY_HEADERS=xforwarded \
    # Salud / métricas -----------------------------------------------------------
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

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
  exec /opt/keycloak/bin/kc.sh start \
       --db=${KC_DB} \
       --db-url=${KC_DB_URL} \
       --db-username=${KC_DB_USERNAME} \
       --db-password=${KC_DB_PASSWORD} \
       --http-port=${KC_HTTP_PORT} \
       --hostname-strict=${KC_HOSTNAME_STRICT} \
       --proxy=${KC_PROXY} \
       --proxy-headers=${KC_PROXY_HEADERS} \
       --health-enabled=${KC_HEALTH_ENABLED} \
       --metrics-enabled=${KC_METRICS_ENABLED} \
       --optimized \
       --bootstrap-admin-username=${KEYCLOAK_ADMIN} \
       --bootstrap-admin-password=${KEYCLOAK_ADMIN_PASSWORD}"]