FROM quay.io/keycloak/keycloak:26.2.4

# Variables básicas para dev-file
ENV KC_DB=dev-file \
    KC_HTTP_PORT=8080 \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_PROXY=edge \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded

# Copia y marca ejecutable nuestro wrapper de arranque
COPY start.sh /opt/keycloak/start.sh
RUN chmod +x /opt/keycloak/start.sh

EXPOSE 8080

# ¡Este es el ENTRYPOINT que debes usar!
ENTRYPOINT ["/opt/keycloak/start.sh"]