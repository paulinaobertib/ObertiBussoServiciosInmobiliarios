# syntax=docker/dockerfile:1.7

######################## Build ########################
FROM alpine:3.20 AS build
WORKDIR /app

# JDK con jmods (MUSL) + utilidades mínimas
RUN apk add --no-cache openjdk24-jdk bash coreutils ca-certificates \
      && update-ca-certificates

ENV JAVA_HOME=/usr/lib/jvm/java-24-openjdk
ENV PATH="$JAVA_HOME/bin:$PATH"
ENV MAVEN_CONFIG=/root/.m2

# Wrapper Maven y cache de dependencias
COPY pom.xml ./
COPY .mvn .mvn/
COPY mvnw mvnw
RUN chmod +x mvnw
RUN --mount=type=cache,target=/root/.m2 \
      ./mvnw -q -B dependency:go-offline

# Compilar
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
      ./mvnw -q -B -T 1C clean package -DskipTests

# Extraer CAPAS del jar (para pulls rápidos)
RUN mkdir -p /layers \
      && java -Djarmode=tools -jar target/*.jar extract --layers --launcher --destination /layers

# ---- jlink: runtime con TODOS los módulos del JDK ----
# Usamos ALL-MODULE-PATH sobre los .jmod del JDK de Alpine (musl),
# así el binario resultante corre en Alpine runtime.
RUN $JAVA_HOME/bin/jlink -J-Xmx2g --verbose \
      --module-path "$JAVA_HOME/jmods" \
      --add-modules ALL-MODULE-PATH \
      --strip-debug --no-man-pages --no-header-files --compress=2 \
      --output /jre-full

######################## Runtime ########################
FROM alpine:3.20
WORKDIR /app

# Certificados y usuario no root
RUN apk add --no-cache ca-certificates \
      && update-ca-certificates \
      && addgroup -S app && adduser -S app -G app
USER app

# Copiamos runtime y capas
COPY --from=build /jre-full /opt/jre
COPY --from=build /layers/dependencies/          ./dependencies/
COPY --from=build /layers/snapshot-dependencies/ ./snapshot-dependencies/
COPY --from=build /layers/spring-boot-loader/    ./spring-boot-loader/
COPY --from=build /layers/application/           ./application/

# Vars
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

EXPOSE 8090

# Arranque por capas con JarLauncher
ENTRYPOINT ["sh","-lc","exec java $JAVA_TOOL_OPTIONS -cp /app:/app/dependencies/*:/app/snapshot-dependencies/*:/app/spring-boot-loader/*:/app/application/* org.springframework.boot.loader.launch.JarLauncher"]
