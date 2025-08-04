FROM quay.io/keycloak/keycloak:latest AS builder
ENV KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_DB=postgres
WORKDIR /opt/keycloak

# Certificado demo (no usar en prod)
RUN keytool -genkeypair -storepass password -storetype PKCS12 \
    -keyalg RSA -keysize 2048 -dname "CN=server" -alias server \
    -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore

RUN /opt/keycloak/bin/kc.sh build

###############################################################################
# Imagen final
###############################################################################
FROM quay.io/keycloak/keycloak:latest
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# ── Base config (sin secretos) ────────────────────────────────────────────────
ENV KC_DB=postgres \
    KC_DB_URL=jdbc:postgresql://ep-proud-lab-a8civfa8-pooler.eastus2.azure.neon.tech:5432/neondb?sslmode=require \
    KC_DB_USERNAME=neondb_owner \
    KC_PROXY=edge \
    KC_PROXY_HEADERS=xforwarded \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_HOSTNAME=app-ms-keycloak-dev.azurewebsites.net \
    KC_HTTP_PORT=8080 \
    KC_BOOTSTRAP_ADMIN_USERNAME=admin \
    KC_BOOTSTRAP_ADMIN_PASSWORD=inmtesistpv\
    KC_DB_PASSWORD=npg_t3buYnI7kPMK

# ── Admin inicial (se cargan como *App Settings* en Azure) ────────────────────

# ENTRYPOINT + CMD: ahora sí arranca Keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--http-port=8080"]

EXPOSE 8080
