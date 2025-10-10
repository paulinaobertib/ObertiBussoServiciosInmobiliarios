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

# Extraemos capas para mejorar la reutilización del build cache
RUN java -Djarmode=layertools -jar target/*.jar extract

####################### Runtime stage #######################
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app

# Configuración de Java adaptada a planes chicos de App Service
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:InitialRAMPercentage=25 -XX:MaxRAMPercentage=75 -XX:+UseSerialGC -XX:+AlwaysActAsServerClassMachine"
ENV SPRING_BOOT_MAIN_CLASS="pi.ms_gateway.MsGatewayApplication"
ENV SPRING_BOOT_LOADER_PATH="application/BOOT-INF/classes,dependencies/BOOT-INF/lib,snapshot-dependencies/BOOT-INF/lib"

# Copiamos las capas del artefacto
COPY --from=build /app/dependencies/ ./dependencies/
COPY --from=build /app/snapshot-dependencies/ ./snapshot-dependencies/
COPY --from=build /app/spring-boot-loader/ ./spring-boot-loader/
COPY --from=build /app/application/ ./application/

# Puerto
EXPOSE 8090

# Limpieza de archivos innecesarios (reduce tamaño)
RUN rm -rf /tmp/* /var/tmp/* /usr/share/man /usr/share/doc

# Comando de arranque
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -cp spring-boot-loader -Dloader.path=$SPRING_BOOT_LOADER_PATH -Dloader.main=$SPRING_BOOT_MAIN_CLASS org.springframework.boot.loader.launch.PropertiesLauncher"]
