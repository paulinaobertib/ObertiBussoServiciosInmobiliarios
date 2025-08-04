FROM quay.io/keycloak/keycloak:26.1.3 AS builder

WORKDIR /opt/keycloak

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.1.3
COPY --from=builder /opt/keycloak/ /opt/keycloak/

ENV KC_BOOTSTRAP_ADMIN_USERNAME=${KEYCLOAK_ADMIN}
ENV KC_BOOTSTRAP_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}

ENV KC_DB=postgres
ENV KC_DB_URL=jdbc:postgresql://ep-proud-lab-a8civfa8-pooler.eastus2.azure.neon.tech:5432/neondb?sslmode=require
ENV KC_DB_USERNAME=neondb_owner
ENV KC_DB_PASSWORD=npg_t3buYnI7kPMK

ENV KC_PROXY=edge
ENV KC_HTTP_PORT=8443
ENV KC_HTTP_ENABLED=true
ENV KC_PROXY-HEADERS=xforwarded
ENV KC_HOSTNAME-STRICT=false

EXPOSE 8443

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]