-- Run manually against ms-properties and ms-users databases (ddl-auto: none).
-- ms-properties:

ALTER TABLE Property
  ADD COLUMN garages INT NULL AFTER bedrooms,
  ADD COLUMN floor INT NULL AFTER garages,
  ADD COLUMN private_area FLOAT NULL AFTER covered_area,
  ADD COLUMN video VARCHAR(500) NULL AFTER description,
  ADD COLUMN zip_code VARCHAR(20) NULL AFTER number,
  ADD COLUMN network_share TINYINT(1) NULL DEFAULT 0 AFTER financing,
  ADD COLUMN property_condition ENUM('NUEVA','USADA','EN_PROYECTO','EN_CONSTRUCCION') NULL AFTER status,
  ADD COLUMN rents_type ENUM('DIARIO','SEMANAL','QUINCENAL','MENSUAL') NULL AFTER operation;

CREATE TABLE IF NOT EXISTS wasi_property_sync (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id      BIGINT NULL,
  wasi_property_id INT NOT NULL,
  synced_at        DATETIME NOT NULL,
  sync_portals     TEXT NULL COMMENT 'JSON array of Wasi portal IDs',
  publish_to_wasi  TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uk_property_id (property_id),
  UNIQUE KEY uk_wasi_property_id (wasi_property_id),
  CONSTRAINT fk_wasi_prop_sync_property
    FOREIGN KEY (property_id) REFERENCES Property(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wasi_owner_sync (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_id         BIGINT NULL,
  wasi_client_id   INT NOT NULL,
  synced_at        DATETIME NOT NULL,
  UNIQUE KEY uk_owner_id (owner_id),
  UNIQUE KEY uk_wasi_client_id (wasi_client_id),
  CONSTRAINT fk_wasi_owner_sync_owner
    FOREIGN KEY (owner_id) REFERENCES Owner(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wasi_location_mapping (
  id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
  neighborhood_id    BIGINT NOT NULL,
  wasi_country_id    INT NOT NULL DEFAULT 5,
  wasi_region_id     INT NOT NULL,
  wasi_city_id       INT NOT NULL,
  wasi_location_id   INT NULL,
  wasi_zone_id       INT NULL,
  UNIQUE KEY uk_neighborhood_id (neighborhood_id),
  CONSTRAINT fk_wasi_loc_map_neighborhood
    FOREIGN KEY (neighborhood_id) REFERENCES Neighborhood(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ms-users:

CREATE TABLE IF NOT EXISTS wasi_tenant_sync (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id          VARCHAR(255) NOT NULL,
  wasi_client_id   INT NOT NULL,
  synced_at        DATETIME NOT NULL,
  UNIQUE KEY uk_user_id (user_id),
  UNIQUE KEY uk_wasi_client_id (wasi_client_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
