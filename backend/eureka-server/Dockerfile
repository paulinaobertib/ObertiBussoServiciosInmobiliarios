# syntax=docker/dockerfile:1.7

######################## Build ########################
FROM eclipse-temurin:24-jdk-alpine AS build
WORKDIR /app
ENV MAVEN_CONFIG=/root/.m2

# Copiamos lo mínimo para cachear deps
COPY pom.xml ./
COPY .mvn .mvn/
COPY mvnw mvnw
RUN chmod +x mvnw

# Cache de dependencias (rápido en builds)
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -q -Dmaven.artifact.threads=8 dependency:go-offline

# Compilar
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -T 1C -B -q -Dmaven.artifact.threads=8 clean package -DskipTests

# Extraer CAPAS del jar para que los pulls sean más rápidos en cambios pequeños
# (no reduce MB totales, pero sí datos transferidos en despliegues incrementales)
RUN mkdir -p /layers \
    && java -Djarmode=tools -jar target/*.jar extract --layers --launcher --destination /layers

######################## Runtime ########################
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app

# --- PODA DEL JRE: ahorra ~15-30 MB, sin tocar módulos críticos ---
# Quita documentación legal y el CDS archive (arranque algo menos veloz, imagen más liviana)
RUN rm -rf /opt/java/openjdk/legal || true \
    && rm -f  /opt/java/openjdk/lib/server/classes.jsa || true

# Copiamos por capas (mejor para pulls cuando cambia sólo tu app)
COPY --from=build /layers/dependencies/          ./dependencies/
COPY --from=build /layers/snapshot-dependencies/ ./snapshot-dependencies/
COPY --from=build /layers/spring-boot-loader/    ./spring-boot-loader/
COPY --from=build /layers/application/           ./application/

# (Alternativa: si prefieres el jar único, descomenta estas dos y borra las 4 COPY de arriba)
# COPY --from=build /app/target/*.jar ./app.jar

# Java opts típicos para Azure
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"

# Puerto (ajústalo si tu app escucha otro)
EXPOSE 8761

# Limpieza del sistema para rascar unos MB
RUN rm -rf /tmp/* /var/tmp/* /usr/share/man /usr/share/doc

# Arranque por capas (Spring Boot Launcher)
ENTRYPOINT ["sh","-lc","exec java $JAVA_OPTS -cp /app:/app/dependencies/*:/app/snapshot-dependencies/*:/app/spring-boot-loader/*:/app/application/* org.springframework.boot.loader.launch.JarLauncher"]

# (Si usas jar único, en su lugar:)
# ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar app.jar"]
