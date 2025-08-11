####################### Build stage #######################
FROM eclipse-temurin:24-jdk-alpine AS build
WORKDIR /app

# Maven cache path
ENV MAVEN_CONFIG=/root/.m2

# Copiamos solo lo necesario para deps
COPY pom.xml .
COPY .mvn .mvn/
COPY mvnw mvnw
RUN chmod +x mvnw

# Descarga dependencias en paralelo
RUN ./mvnw -B -q -Dmaven.artifact.threads=8 dependency:go-offline

# Copiamos código y compilamos
COPY src ./src
RUN ./mvnw -T 1C -B -q -Dmaven.artifact.threads=8 clean package -DskipTests

####################### Runtime stage #######################
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app

# Flags JVM para arrancar más rápido en B1 y limitar memoria
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"

# Copiamos solo el JAR
COPY --from=build /app/target/*.jar app.jar

# Puerto
EXPOSE 8083

# Limpieza de archivos innecesarios (reduce tamaño)
RUN rm -rf /tmp/* /var/tmp/* /usr/share/man /usr/share/doc

# Comando de arranque
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar app.jar"]
