FROM quay.io/keycloak/keycloak:26.2.4 AS builder

# --- incluimos aquí las opciones de build-time ---
RUN /opt/keycloak/bin/kc.sh build \
    --db dev-file \
    --spi-dblock-provider=jpa \
    --health-enabled=true \
    --metrics-enabled=true

FROM quay.io/keycloak/keycloak:26.2.4
COPY --from=builder /opt/keycloak /opt/keycloak

# Runtime solo necesita HTTP y optimized
ENV KC_HTTP_ENABLED=true \
    KC_HTTP_PORT=8080 \
    KC_PROXY=edge

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", \
           "--import-realm", \
           "--http-enabled=true", \
           "--http-port=8080", \
           "--optimized"]