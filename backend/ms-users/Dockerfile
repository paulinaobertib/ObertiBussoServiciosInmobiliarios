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

# Extraemos capas del JAR para cachear dependencias
RUN java -Djarmode=layertools -jar target/*.jar extract

####################### Runtime stage #######################
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app

# Flags JVM afinadas para App Service
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:InitialRAMPercentage=25 -XX:MaxRAMPercentage=75 -XX:+UseSerialGC -XX:+AlwaysActAsServerClassMachine"

# Copiamos cada capa del fat JAR
COPY --from=build /app/dependencies/ ./dependencies/
COPY --from=build /app/snapshot-dependencies/ ./snapshot-dependencies/
COPY --from=build /app/spring-boot-loader/ ./spring-boot-loader/
COPY --from=build /app/application/ ./application/

# Puerto
EXPOSE 8081

# Limpieza de archivos innecesarios (reduce tamaño)
RUN rm -rf /tmp/* /var/tmp/* /usr/share/man /usr/share/doc

# Comando de arranque
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -cp 'spring-boot-loader/*:dependencies/*:snapshot-dependencies/*:application' org.springframework.boot.loader.launch.JarLauncher"]
