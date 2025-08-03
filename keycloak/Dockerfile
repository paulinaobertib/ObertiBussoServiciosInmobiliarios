# ────────────────────────────────────────────────────────────────
# Keycloak 26 .x con base de datos H2 “dev-file” PERSISTENTE
# Los datos se guardan en /home/data/h2  (que Azure monta en Azure Files)
# ────────────────────────────────────────────────────────────────
FROM quay.io/keycloak/keycloak:26.2.4

# ── 1) Variables de entorno que Keycloak necesita ───────────────
ENV KC_DB=dev-file \
    KC_DB_FILE_DIR=/home/data/h2 \
    KC_HTTP_PORT=8080 \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_PROXY=edge \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded

EXPOSE 8080

# ── 2) Crear la carpeta donde se guardará la BD y dar permisos ──
USER root
RUN mkdir -p /home/data/h2 && chown -R 1000:1000 /home/data
USER 1000   # ← volvemos al usuario que ejecuta Keycloak

# ── 3) Arranque: start-dev usa KEYCLOAK_ADMIN y la BD dev-file ──
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--http-port=8080", "--hostname-strict=false"]