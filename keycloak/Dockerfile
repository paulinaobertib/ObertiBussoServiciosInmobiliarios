FROM quay.io/keycloak/keycloak:26.2.4

# Variables mínimas para H2 dev-file
ENV KC_DB=dev-file \
    KC_HTTP_PORT=8080 \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_PROXY=edge \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded

EXPOSE 8080

ENTRYPOINT ["sh","-c", "\
  mkdir -p /opt/keycloak/data/h2 && \
  rm -f /opt/keycloak/data/h2/*.lock.db /opt/keycloak/data/h2/DATABASECHANGELOGLOCK* && \
  exec /opt/keycloak/bin/kc.sh start-dev --import-realm --http-port=8080\
    --bootstrap-admin-user=${KEYCLOAK_ADMIN} \
    --bootstrap-admin-password=${KEYCLOAK_ADMIN_PASSWORD}\
"]