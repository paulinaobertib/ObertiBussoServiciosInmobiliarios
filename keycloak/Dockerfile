####################  STAGE 1 – build  ####################
FROM quay.io/keycloak/keycloak:26.3.2 AS builder

# La BD será dev-file y vivirá en /home/data/h2  (¡nombre correcto!)
ENV KC_DB=dev-file \
    KC_DB_FILE_DIR=/home/data/h2 \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

WORKDIR /opt/keycloak
RUN /opt/keycloak/bin/kc.sh build --optimized

####################  STAGE 2 – runtime  ##################
FROM quay.io/keycloak/keycloak:26.3.2

COPY --from=builder /opt/keycloak/ /opt/keycloak/

ENV KC_DB=dev-file \
    KC_DB_FILE_DIR=/home/data/h2 \
    KC_HTTP_PORT=8080 \
    KC_HTTPS_PORT=-1 \
    KC_HOSTNAME_STRICT=false \
    KC_PROXY_HEADERS=xforwarded \
    KC_HEALTH_ENABLED=true \
    KC_METRICS_ENABLED=true

# carpeta persistente dentro del File Share
USER root
RUN mkdir -p /home/data/h2 && chown -R 1000:1000 /home/data
USER 1000

EXPOSE 8080

# 👉 ¡ya NO pasamos --db!  Solo --optimized, puertos y demás.
ENTRYPOINT ["sh","-c", "\
  mkdir -p ${KC_DB_FILE_DIR} && \
  rm -f ${KC_DB_FILE_DIR}/*.lock.db ${KC_DB_FILE_DIR}/DATABASECHANGELOGLOCK* || true && \
  exec /opt/keycloak/bin/kc.sh start \
       --optimized \
       --http-port=${KC_HTTP_PORT} \
       --https-port=${KC_HTTPS_PORT}"]
