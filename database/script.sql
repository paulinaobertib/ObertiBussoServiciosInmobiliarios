CREATE DATABASE IF NOT EXISTS obertibussoserviciosinmobiliarios;
USE obertibussoserviciosinmobiliarios;

CREATE TABLE Owner (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL
);

CREATE TABLE Type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    has_rooms BOOLEAN NOT NULL,
    has_bathrooms BOOLEAN NOT NULL,
    has_bedrooms BOOLEAN NOT NULL,
    has_covered_area BOOLEAN NOT NULL
);

CREATE TABLE Neighborhood (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    type ENUM('CERRADO', 'SEMICERRADO', 'ABIERTO') NOT NULL,
    city VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
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
	currency ENUM('USD', 'ARS') NOT NULL,
    title VARCHAR(255) NOT NULL,
    street VARCHAR(150) NOT NULL,
    number VARCHAR(10) NOT NULL,
    rooms INT NOT NULL,
    bathrooms INT NOT NULL,
    bedrooms INT NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    covered_area DECIMAL(10, 2) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    show_price BOOLEAN NOT NULL,
    expenses DECIMAL(15, 2),
    description VARCHAR(2000),
    date DATETIME NOT NULL,
    main_image VARCHAR(255),
    credit BOOLEAN NOT NULL,
    financing BOOLEAN NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES Owner(id), 
    FOREIGN KEY (neighborhood_id) REFERENCES Neighborhood(id),
    FOREIGN KEY (type_id) REFERENCES Type(id)
);

CREATE TABLE Comment (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    description TEXT NOT NULL,
    date DATETIME NOT NULL,
	property_id BIGINT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(id)
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

CREATE TABLE User_View (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    property_id BIGINT NOT NULL,
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
    user_id VARCHAR(100) NOT NULL,
    property_id BIGINT NOT NULL,
    type ENUM('TEMPORAL', 'VIVIENDA', 'COMERCIAL') NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('ACTIVO', 'INACTIVO') NOT NULL,
    increase DECIMAL(5,2) NOT NULL,
    increase_frequency BIGINT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(id) ON DELETE CASCADE
);

CREATE TABLE Contract_Increase (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    date DATETIME NOT NULL,
    currency ENUM('USD', 'ARS') NOT NULL,
	amount DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (contract_id) REFERENCES Contract(id) ON DELETE CASCADE
);

CREATE TABLE Payment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    currency ENUM('USD', 'ARS') NOT NULL,
	amount DECIMAL(15,2) NOT NULL,
    date DATETIME NOT NULL,
    description VARCHAR(2000) NOT NULL,
    FOREIGN KEY (contract_id) REFERENCES Contract(id) ON DELETE CASCADE
);

CREATE TABLE User_Notification_Preference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    type ENUM('PROPIEDADNUEVA', 'PROPIEDADINTERES') NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(user_id, type)
);

CREATE TABLE Notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    type ENUM('PROPIEDADNUEVA', 'PROPIEDADINTERES') NOT NULL,
    date DATETIME NOT NULL
);

CREATE TABLE Favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
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

CREATE TABLE Available_Appointment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date DATETIME NOT NULL UNIQUE,
    availability BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Appointment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    availability_id BIGINT UNIQUE,
    status ENUM('ACEPTADO', 'RECHAZADO', 'ESPERA') NOT NULL,
    comment VARCHAR(250),
    appointment_date DATETIME NOT NULL,
    FOREIGN KEY (availability_id) REFERENCES Available_Appointment(id)
);

CREATE TABLE Notice (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    date DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    main_image VARCHAR(255),
    description VARCHAR(2000) NOT NULL
);

CREATE TABLE Inquiry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100),
    date DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status ENUM('ABIERTA', 'CERRADA') NOT NULL,
    date_close DATETIME,
    phone VARCHAR(30) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL
);

CREATE TABLE Property_Inquiry (
    inquiry_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    FOREIGN KEY (inquiry_id) REFERENCES Inquiry(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES Property(id)
);

CREATE TABLE Survey (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    score TINYINT NOT NULL,
    comment VARCHAR(255),
	inquiry_id BIGINT NOT NULL,
	FOREIGN KEY (inquiry_id) REFERENCES Inquiry(id) ON DELETE CASCADE
);

CREATE TABLE Chat_Session (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    user_id VARCHAR(100),
    date DATETIME NOT NULL,
    date_close DATETIME,
    derived BOOLEAN DEFAULT FALSE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Property(id) ON DELETE CASCADE
);

CREATE TABLE Chat_Message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id BIGINT NOT NULL,
    chat_option ENUM('VER_PRECIO', 'VER_HABITACIONES', 'VER_AREA', 'VER_UBICACION', 'VER_CARACTERISTICAS', 'VER_OPERACION', 'VER_CREDITO', 'VER_FINANCIACION', 'DERIVAR', 'CERRAR') NOT NULL,
    FOREIGN KEY (session_id) REFERENCES Chat_Session(id)
);

CREATE TABLE Chat_Derivation (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	session_id BIGINT NOT NULL,
    agent_id VARCHAR(100) NOT NULL,
	FOREIGN KEY (session_id) REFERENCES Chat_Session(id)
);

CREATE TABLE Agent_Chat (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	user_id VARCHAR(100) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Agent_Assignment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    last_assigned_agent_id VARCHAR(100)
);