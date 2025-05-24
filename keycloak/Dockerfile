# FROM quay.io/keycloak/keycloak:26.2.4

# ENV KC_HEALTH_ENABLED=true
# ENV KC_METRICS_ENABLED=true
# ENV KC_DB=dev-file

# COPY realm/realm-obertibussoserviciosinmobiliarios.json /opt/keycloak/data/import/

# EXPOSE 8080

# ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm", "--http-port=8080"]

FROM quay.io/keycloak/keycloak:26.2.4

ENV KC_DB=dev-file
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_HTTP_ENABLED=true
ENV KC_HTTP_PORT=8080
ENV QUARKUS_HTTP_PORT=8080
ENV KC_PROXY=edge
ENV KC_HOSTNAME_STRICT=false
ENV KC_PROXY_HEADERS=xforwarded

COPY realm/realm-obertibussoserviciosinmobiliarios.json /opt/keycloak/data/import/

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm", "--http-port=8080"]