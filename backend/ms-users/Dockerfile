# syntax=docker/dockerfile:1.7

######################## Build ########################
FROM eclipse-temurin:24-jdk-alpine AS build
WORKDIR /app
ENV MAVEN_CONFIG=/root/.m2

# Prepara wrapper y cachea dependencias
COPY pom.xml ./
COPY .mvn .mvn/
COPY mvnw mvnw
RUN chmod +x mvnw
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -B dependency:go-offline

# Compila
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -B -T 1C clean package -DskipTests

# Extrae CAPAS del jar (para que en redeploy baje sólo application/)
RUN mkdir -p /layers \
    && java -Djarmode=layertools -jar target/*.jar extract --destination /layers

# ---- jlink: runtime con TODOS los módulos del JDK ----
# Incluye java.se completo + jdk.* (management, jfr, zipfs, charsets, localedata, etc.)
RUN $JAVA_HOME/bin/jlink -J-Xmx2g --verbose \
    --module-path "$JAVA_HOME/jmods" \
    --add-modules ALL-MODULE-PATH \
    --strip-debug --no-man-pages --no-header-files --compress=2 \
    --output /jre-full

######################## Runtime ########################
FROM alpine:3.20
WORKDIR /app

# Runtime y capas
COPY --from=build /jre-full /opt/jre
COPY --from=build /layers/dependencies/          ./dependencies/
COPY --from=build /layers/snapshot-dependencies/ ./snapshot-dependencies/
COPY --from=build /layers/spring-boot-loader/    ./spring-boot-loader/
COPY --from=build /layers/application/           ./application/

# Usuario no root
RUN addgroup -S app && adduser -S app -G app
USER app

# Java + flags de arranque
ENV PATH="/opt/jre/bin:${PATH}"
ENV PORT=8083
ENV JAVA_TOOL_OPTIONS="\
    -XX:+UseSerialGC \
    -XX:TieredStopAtLevel=1 \
    -XX:InitialRAMPercentage=40 \
    -XX:MaxRAMPercentage=70 \
    -XX:+ExitOnOutOfMemoryError \
    -Dserver.port=${PORT} \
    "

EXPOSE 8081

# Ejecuta por capas con el JarLauncher de Spring Boot
ENTRYPOINT ["sh","-lc","exec java $JAVA_TOOL_OPTIONS -cp /app:/app/dependencies/*:/app/snapshot-dependencies/*:/app/spring-boot-loader/*:/app/application/* org.springframework.boot.loader.launch.JarLauncher"]
