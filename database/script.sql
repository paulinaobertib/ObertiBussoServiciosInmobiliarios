CREATE DATABASE IF NOT EXISTS obertibussoserviciosinmobiliarios;
USE obertibussoserviciosinmobiliarios;

CREATE TABLE Owner (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mail VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL
);

CREATE TABLE Type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    has_rooms BOOLEAN NOT NULL,
    has_bathrooms BOOLEAN NOT NULL,
    has_bedrooms BOOLEAN NOT NULL
);

CREATE TABLE Neighborhood (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    type ENUM('CERRADO', 'SEMICERRADO', 'ABIERTO') NOT NULL,
    city VARCHAR(255) NOT NULL
);

CREATE TABLE Amenity (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE Property (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    neighborhood_id BIGINT NOT NULL,
    type_id BIGINT NOT NULL,
    status ENUM('DISPONIBLE', 'VENDIDA', 'ALQUILADA', 'RESERVADA') NOT NULL,
    operation ENUM('VENTA', 'ALQUILER') NOT NULL,
	currency ENUM('USD', 'ARG') NOT NULL,
    title VARCHAR(255) NOT NULL,
    street VARCHAR(150) NOT NULL,
    number VARCHAR(10) NOT NULL,
    rooms INT NOT NULL,
    bathrooms INT NOT NULL,
    bedrooms INT NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    description VARCHAR(2000),
    date DATETIME NOT NULL,
    main_image VARCHAR(255),
    FOREIGN KEY (owner_id) REFERENCES Owner(id), 
    FOREIGN KEY (neighborhood_id) REFERENCES Neighborhood(id),
    FOREIGN KEY (type_id) REFERENCES Type(id)
);

CREATE TABLE Property_Amenity (
    amenity_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    FOREIGN KEY (amenity_id) REFERENCES Amenity(id),
    FOREIGN KEY (property_id) REFERENCES Property(id)
);

CREATE TABLE View (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    date DATETIME NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(id) ON DELETE CASCADE
);

CREATE TABLE Image (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    url VARCHAR(255) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(id)
);

CREATE TABLE Contract (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(30) NOT NULL,
    property_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status ENUM('activo', 'inactivo') NOT NULL,
    increase DECIMAL(5,2),
    increase_frequency VARCHAR(50),
    FOREIGN KEY (property_id) REFERENCES Property(id) ON DELETE CASCADE
);

CREATE TABLE Payment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    date DATETIME NOT NULL,
    description VARCHAR(2000) NOT NULL,
    FOREIGN KEY (contract_id) REFERENCES Contract(id) ON DELETE CASCADE
);

CREATE TABLE Notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(30) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    date DATETIME NOT NULL
);

CREATE TABLE Favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(30) NOT NULL,
    property_id BIGINT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(id) ON DELETE CASCADE
);

CREATE TABLE Maintenance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    date DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(id) ON DELETE CASCADE
);

CREATE TABLE Appointment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(30) NOT NULL,
    date DATETIME NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    comment VARCHAR(250)
);

CREATE TABLE News (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(30) NOT NULL,
    date DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    image VARCHAR(255)
);

CREATE TABLE Inquiry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(30) NOT NULL,
    date DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL
);

CREATE TABLE Property_Inquiry (
    inquiry_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    FOREIGN KEY (inquiry_id) REFERENCES Inquiry(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES Property(id)
);