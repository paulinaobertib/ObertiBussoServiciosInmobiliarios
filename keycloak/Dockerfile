########################  STAGE 1 – build  ########################
FROM quay.io/keycloak/keycloak:26.2.4 AS builder

# 1. Build-time flags (se incrustan en la imagen optimizada)
ENV KC_DB=dev-file \
    KC_DB_FILE_DIR=/home/data/h2 \
    KC_METRICS_ENABLED=true \
    KC_HEALTH_ENABLED=true

# 2. Compilamos Keycloak “optimizado” con el proveedor dev-file
RUN /opt/keycloak/bin/kc.sh build

########################  STAGE 2 – runtime  ######################
FROM quay.io/keycloak/keycloak:26.2.4

# 3. Copiamos el runtime ya optimizado
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# 4. Variables que *sí* se pueden cambiar en runtime
ENV KC_DB_FILE_DIR=/home/data/h2 \
    KC_HTTP_PORT=8080 \
    KC_HTTP_ENABLED=true \
    KC_PROXY=edge \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded \
    KC_METRICS_ENABLED=true \
    KC_HEALTH_ENABLED=true

# 5. Carpeta persistente en /home (Azure la monta como File Share)
USER root
RUN mkdir -p /home/data/h2 && chown -R 1000:1000 /home/data
USER 1000

EXPOSE 8080

# 6. Arranque en modo producción (sin sobre-escribir la BD)
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--http-port=8080"]
