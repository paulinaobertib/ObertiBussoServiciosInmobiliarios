################ Etapa de build ################
FROM eclipse-temurin:24-jdk AS build
WORKDIR /app

# Instalamos Maven 3.9 (solo para compilar):
RUN apt-get update \
    && apt-get install -y --no-install-recommends maven \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copiamos el código y compilamos
COPY pom.xml .
COPY .mvn .mvn/
COPY mvnw mvnw
COPY src ./src
RUN chmod +x mvnw && ./mvnw -B clean package -DskipTests

################ Etapa de runtime ##############
FROM eclipse-temurin:24-jdk 
WORKDIR /app

# Copiamos sólo el JAR ya construido
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8761
ENTRYPOINT ["java","-jar","app.jar"]
