################ Etapa de build ################
FROM eclipse-temurin:24-jdk AS build
WORKDIR /app

# (Opcional pero útil) Config de Maven en contenedor
ENV MAVEN_CONFIG=/root/.m2

# Copiamos solo lo mínimo para resolver deps y aprovechar la caché
COPY pom.xml .
COPY .mvn .mvn/
COPY mvnw mvnw
RUN chmod +x mvnw

#  Pre-descarga de dependencias para modo offline
RUN ./mvnw -B -q -e dependency:go-offline

# Ahora sí, copiamos el código y compilamos
COPY src ./src
RUN ./mvnw -B clean package -DskipTests

################ Etapa de runtime ##############
# Podés usar jre para reducir peso (si tu app no necesita jdk)
FROM eclipse-temurin:24-jre
WORKDIR /app

# Copiamos sólo el JAR ya construido
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8090
ENTRYPOINT ["java","-jar","app.jar"]