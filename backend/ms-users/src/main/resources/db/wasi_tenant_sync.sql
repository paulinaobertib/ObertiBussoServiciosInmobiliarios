CREATE TABLE IF NOT EXISTS wasi_tenant_sync (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL COMMENT 'Keycloak user ID',
  wasi_client_id INT NOT NULL,
  synced_at DATETIME NOT NULL,
  UNIQUE KEY uk_user_id (user_id),
  UNIQUE KEY uk_wasi_client_id (wasi_client_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
