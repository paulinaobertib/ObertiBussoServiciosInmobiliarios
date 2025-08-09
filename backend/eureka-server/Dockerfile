# syntax=docker/dockerfile:1.7

######################## Build ########################
FROM eclipse-temurin:24-jdk-alpine AS build
WORKDIR /app
ENV MAVEN_CONFIG=/root/.m2

COPY pom.xml ./
COPY .mvn .mvn/
COPY mvnw mvnw
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline

COPY src ./src
RUN ./mvnw -q -B -T 1C clean package -DskipTests

# ---- jlink: runtime mínimo según tu JAR ----
# Añadimos jdk.crypto.ec (TLS) y jdk.unsupported por si alguna lib lo usa.
RUN jdeps --ignore-missing-deps -q --multi-release 24 --print-module-deps target/*.jar > /tmp/deps \
 && echo ",jdk.crypto.ec,jdk.unsupported,java.desktop" >> /tmp/deps \
 && MODS=$(tr -d '\n' </tmp/deps | sed 's/^,//') \
 && $JAVA_HOME/bin/jlink \
      --add-modules ${MODS} \
      --strip-debug --no-man-pages --no-header-files --compress=2 \
      --output /jre-min

######################## Runtime ########################
FROM alpine:3.20
WORKDIR /app

# Copiamos runtime mínimo y app
COPY --from=build /jre-min /opt/jre
COPY --from=build /app/target/*.jar /app/app.jar

# Usuario no root
RUN addgroup -S app && adduser -S app -G app
USER app

ENV PATH="/opt/jre/bin:${PATH}"
ENV PORT=8761
ENV JAVA_TOOL_OPTIONS="\
 -XX:+UseSerialGC \
 -XX:TieredStopAtLevel=1 \
 -XX:InitialRAMPercentage=40 \
 -XX:MaxRAMPercentage=70 \
 -XX:+ExitOnOutOfMemoryError \
 -Dserver.port=${PORT} \
"
EXPOSE 8761
ENTRYPOINT ["sh","-c","exec /opt/jre/bin/java $JAVA_TOOL_OPTIONS -jar /app/app.jar"]
