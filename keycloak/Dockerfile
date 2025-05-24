FROM quay.io/keycloak/keycloak:26.2.4

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=dev-file
ENV KC_HTTP_PORT=8080
ENV QUARKUS_HTTP_PORT=8080

COPY realm/realm-obertibussoserviciosinmobiliarios.json /opt/keycloak/data/import/

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm"]