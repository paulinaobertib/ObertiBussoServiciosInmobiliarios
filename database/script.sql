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
    has_bedrooms BOOLEAN NOT NULL,
    has_covered_area BOOLEAN NOT NULL
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

CREATE TABLE User_Notification_Preference (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    type ENUM('PROPIEDADNUEVA', 'PROPIEDADINTERES', 'ALQUILER', 'ACTUALIZACION') NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(user_id, type)
);

CREATE TABLE Notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(30) NOT NULL,
    type ENUM('PROPIEDADNUEVA', 'PROPIEDADINTERES', 'ALQUILER', 'ACTUALIZACION') NOT NULL,
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
    status ENUM('ACEPTADO', 'RECHAZADO', 'ESPERA') NOT NULL,
    comment VARCHAR(250)
);

CREATE TABLE Notice (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(30) NOT NULL,
    date DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL
);

CREATE TABLE Inquiry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(30),
    date DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status ENUM('ABIERTA', 'CERRADA') NOT NULL,
    date_close DATETIME,
    phone VARCHAR(30) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mail VARCHAR(100) NOT NULL
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

USE obertibussoserviciosinmobiliarios;

-- 1️⃣  Owners
INSERT INTO Owner (id, first_name, last_name, mail, phone) VALUES
(1,'Juan','Pérez','juan.perez@example.com','+54 351 111-1111'),
(2,'María','García','maria.garcia@example.com','+54 351 222-2222'),
(3,'Carlos','López','carlos.lopez@example.com','+54 351 333-3333'),
(4,'Ana','Rodríguez','ana.rodriguez@example.com','+54 351 444-4444'),
(5,'Lucía','Fernández','lucia.fernandez@example.com','+54 351 555-5555'),
(6,'Diego','Gómez','diego.gomez@example.com','+54 351 666-6666');

-- 2️⃣  Types
INSERT INTO Type (id, name, has_rooms, has_bathrooms, has_bedrooms, has_covered_area) VALUES
(1,'Casa',        TRUE, TRUE, TRUE, TRUE),
(2,'Departamento',TRUE, TRUE, TRUE, TRUE),
(3,'Dúplex',      TRUE, TRUE, TRUE, TRUE),
(4,'Local',        TRUE, TRUE, FALSE, TRUE),
(5,'Galpon',       FALSE, TRUE, FALSE, TRUE),
(6,'Terreno',     FALSE, FALSE, FALSE, FALSE);

-- 3️⃣  Neighborhoods  (todos en la ciudad de Córdoba)
INSERT INTO Neighborhood (id, name, type, city) VALUES
(1,'Valle Escondido',      'CERRADO',     'Córdoba'),
(2,'Country Jockey Club',  'CERRADO',     'Córdoba'),
(3,'Cerro de las Rosas',   'ABIERTO',     'Córdoba'),
(4,'Nueva Córdoba',        'ABIERTO',     'Córdoba'),
(5,'Barrio Jardín',        'SEMICERRADO', 'Córdoba'),
(6,'Altos de Manantiales', 'SEMICERRADO', 'Córdoba');

-- 4️⃣  Amenities
INSERT INTO Amenity (id, name) VALUES
(1,'Pileta'),
(2,'Quincho'),
(3,'Cochera'),
(4,'Jardín'),
(5,'Seguridad 24h'),
(6,'Gimnasio');

-- 5️⃣  Properties  (3 venta + 3 alquiler)
INSERT INTO Property (
  id, owner_id, neighborhood_id, type_id, status, operation, currency,
  title, street, number, rooms, bathrooms, bedrooms,
  area, covered_area, price, show_price, expenses,
  description, date, main_image, credit, financing
) VALUES
(1,1,1,1,'DISPONIBLE','VENTA','USD',
 'Casa premium en Valle Escondido','Av. República de China','1450',
 7,4,4, 850.00,350.00, 450000.00, TRUE,NULL,
 'Casa amplia con pileta y quincho, lista para mudarse.',
 '2025-06-13 10:00:00','https://example.com/img1.jpg', TRUE, TRUE),

(2,2,2,6,'DISPONIBLE','VENTA','USD',
 'Dúplex Country Jockey Club','Calle Jockey Club','500',
 6,3,3, 700.00,300.00, 380000.00, TRUE,NULL,
 'Dúplex elegante con gran jardín y seguridad 24h.',
 '2025-06-13 11:00:00','https://example.com/img2.jpg', TRUE, TRUE),

(3,3,5,3,'DISPONIBLE','VENTA','USD',
 'Departamento moderno en Barrio Jardín','Bv. Los Granaderos','230',
 5,2,2, 350.00,180.00, 220000.00, TRUE,NULL,
 'Departamento a estrenar cerca de colegios y centros comerciales.',
 '2025-06-13 12:00:00','https://example.com/img3.jpg', TRUE, TRUE),

(4,4,3,2,'DISPONIBLE','ALQUILER','ARS',
 'Terreno en Cerro de las Rosas','Av. Rafael Núñez','3500',
 3,1,1, 90.00,90.00, 550000.00, TRUE,45000.00,
 'Departamento amoblado con cochera cubierta.',
 '2025-06-13 13:00:00','https://example.com/img4.jpg', FALSE, FALSE),

(5,5,4,4,'DISPONIBLE','ALQUILER','ARS',
 'Galpon en Nueva Córdoba','Obispo Trejo','420',
 2,1,0, 60.00,60.00, 480000.00, TRUE,40000.00,
 'Galpon ideal para fiestas.',
 '2025-06-13 14:00:00','https://example.com/img5.jpg', FALSE, FALSE),

(6,6,6,5,'DISPONIBLE','ALQUILER','ARS',
 'PH en Altos de Manantiales','Av. de los Álamos','800',
 4,2,2, 200.00,120.00, 620000.00, TRUE,50000.00,
 'PH con patio y quincho compartido.',
 '2025-06-13 15:00:00','https://example.com/img6.jpg', FALSE, FALSE);

-- 6️⃣  Property ↔ Amenity  (2 por propiedad)
INSERT INTO Property_Amenity (amenity_id, property_id) VALUES
 (1,1),(2,1),         -- pileta + quincho
 (4,2),(5,2),         -- jardín + seguridad
 (3,3),(5,3),         -- cochera + seguridad
 (3,4),(4,4),         -- cochera + jardín
 (6,5),(5,5),         -- gimnasio + seguridad
 (2,6),(4,6);         -- quincho + jardín
 
INSERT INTO Comment (description, property_id) VALUES
-- Propiedad 1
('Verificar documentación de la pileta antes de la visita del tasador.', 1),
('Solicitar nuevo presupuesto de pintura para el quincho.',                1),
('Agendar inspección eléctrica anual para septiembre.',                  1),

-- Propiedad 2
('Reemplazar sensor de luz en el jardín; parpadea por las noches.',      2),
('Confirmar póliza de seguro con el country antes de la firma.',        2),

-- Propiedad 3
('Ajustar cerradura de la puerta principal; feedback del último cliente.',3),
('Pedir cotización de rejas perimetrales adicionales.',                 3),
('Revisar humedad leve detectada en baño secundario.',                    3),

-- Propiedad 4
('Cambiar goma de la canilla del baño; pierde gotas.',                  4),
('Coordinar limpieza profunda antes del próximo inquilino.',             4),

-- Propiedad 5
('Recordar entrega de juego de llaves segundo juego al inquilino.',      5),
('Verificar nivel de gas del termotanque trimestralmente.',             5),

-- Propiedad 6
('Agendar poda de árboles del patio en agosto.',                          6),
('Revisar estado del quincho luego de la última tormenta.',             6),
('Reportar al consorcio la luminaria externa que no enciende.',           6);

INSERT INTO Maintenance (property_id, date, title, description) VALUES
(1, NOW(), 'Cambio de filtros de pileta',
           'Se reemplazaron filtros y se revisó la bomba. Próximo control en 6 meses.'),
(1, NOW(), 'Pintura exterior quincho',
           'Primer mano aplicada. Falta segunda mano y sellador UV.'),

(2, NOW(), 'Revisión de caldera',
           'Mantenimiento preventivo completo. Próxima visita recomendada en 12 meses.'),
(2, NOW(), 'Desinfección de jardín',
           'Aplicado producto orgánico contra hormigas. Revisar efectividad en 3 semanas.'),

(3, NOW(), 'Impermeabilización de terraza',
           'Membrana aplicada. Verificar juntas luego de la próxima lluvia.'),
(3, NOW(), 'Cambio de luminarias LED',
           'Instaladas 12 lámparas. Registrar ahorro energético en próximos meses.'),

(4, NOW(), 'Service aire acondicionado',
           'Filtros limpios y gas recargado. Confirmar temperatura óptima con inquilino.'),
(4, NOW(), 'Pulido de pisos de parquet',
           'Aplicada laca al agua. Evitar tránsito pesado por 48 h.'),

(5, NOW(), 'Reemplazo de termotanque',
           'Instalado equipo de alta eficiencia. Programar inspección en 2026.'),
(5, NOW(), 'Actualización detectores de humo',
           'Unidades probadas y funcionando. Reemplazar baterías en 2030.'),

(6, NOW(), 'Revisión instalación eléctrica',
           'Cambios de llaves térmicas completados. Adjuntar informe al expediente.'),
(6, NOW(), 'Tratamiento madera quincho',
           'Aplicado protector hidrorepelente. Reaplicar cada 18 meses.');
           
           
           
           select * from Type;
		