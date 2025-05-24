# Etapa de build para health/metrics (tal como ya la tienes)
FROM quay.io/keycloak/keycloak:latest AS builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=mysql

WORKDIR /opt/keycloak

RUN keytool -genkeypair \
    -storepass password \
    -storetype PKCS12 \
    -keyalg RSA \
    -keysize 2048 \
    -dname "CN=server" \
    -alias server \
    -ext "SAN:c=DNS:localhost,IP:127.0.0.1" \
    -keystore conf/server.keystore

RUN /opt/keycloak/bin/kc.sh build

# Etapa final: efectivamente el runtime de Keycloak
FROM quay.io/keycloak/keycloak:latest

ENV KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true \
    KC_DB=mysql
    
# Copiamos todo lo construido
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# Copiamos tu realm JSON dentro de la imagen
COPY ../realm/realm-obertibussoserviciosinmobiliarios.json /opt/keycloak/data/import/realm.json

# Arrancamos en modo dev e importamos automáticamente el realm
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", "--import-realm"]
