# 1) Asegura la carpeta H2 (montaje de tu File Share)
mkdir -p /opt/keycloak/data/h2

# 2) Elimina cualquier archivo de lock viejo
rm -f /opt/keycloak/data/h2/*.lock.db /opt/keycloak/data/h2/DATABASECHANGELOGLOCK*

# 3) Arranca Keycloak en modo dev-file
exec /opt/keycloak/bin/kc.sh start-dev --import-realm --http-port=8080