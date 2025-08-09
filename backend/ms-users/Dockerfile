# syntax=docker/dockerfile:1.7

######################## Build ########################
FROM eclipse-temurin:24-jdk-alpine AS build
WORKDIR /app
ENV MAVEN_CONFIG=/root/.m2

# Cache m2 para builds rápidos
COPY pom.xml ./
COPY .mvn .mvn/
COPY mvnw mvnw
RUN chmod +x mvnw
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -B dependency:go-offline

# Compilación
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -q -B -T 1C clean package -DskipTests

# Extraer CAPAS del jar (reduce MB descargados en redeploys)
RUN mkdir -p /layers \
    && java -Djarmode=layertools -jar target/*.jar extract --destination /layers

# ---- jlink: runtime "mínimo seguro" para Spring/Tomcat/JPA ----
# Incluye: java.desktop (java.beans), java.management (JMX), java.naming (JNDI),
# java.xml, java.logging, java.sql, jdk.crypto.ec (TLS EC), jdk.unsupported (Unsafe),
# jdk.charsets (charsets extendidos).
RUN $JAVA_HOME/bin/jlink -J-Xmx2g --verbose \
    --add-modules java.base,java.sql,java.naming,java.management,java.xml,java.desktop,java.logging,jdk.crypto.ec,jdk.unsupported,jdk.charsets \
    --strip-debug --no-man-pages --no-header-files --compress=2 \
    --output /jre-min

######################## Runtime ########################
FROM alpine:3.20
WORKDIR /app

# Runtime y capas
COPY --from=build /jre-min /opt/jre
COPY --from=build /layers/dependencies/         ./dependencies/
COPY --from=build /layers/snapshot-dependencies/ ./snapshot-dependencies/
COPY --from=build /layers/spring-boot-loader/    ./spring-boot-loader/
COPY --from=build /layers/application/           ./application/

# Usuario no root
RUN addgroup -S app && adduser -S app -G app
USER app

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

# Classpath por capas + JarLauncher
ENTRYPOINT ["sh","-lc","exec /opt/jre/bin/java $JAVA_TOOL_OPTIONS -cp /app:/app/dependencies/*:/app/snapshot-dependencies/*:/app/spring-boot-loader/*:/app/application/* org.springframework.boot.loader.launch.JarLauncher"]
