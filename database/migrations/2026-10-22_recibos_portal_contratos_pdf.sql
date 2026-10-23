-- Recibos, accesos del portal de inquilinos y PDF de contratos.
-- ms-users corre con ddl-auto: none, asi que esto se ejecuta a mano UNA vez en la base (dev y prod)
-- antes de desplegar la version nueva. Es idempotente (IF NOT EXISTS / INSERT IGNORE).
-- Nombres en minuscula: Hibernate los busca asi y el MySQL de Aiven distingue mayusculas
-- (las tablas Property/Contract en mayuscula son restos del script viejo, no las usa la app).

-- Que secciones ve cada inquilino (si no tiene fila, ve contratos y recibos)
CREATE TABLE IF NOT EXISTS tenant_portal_access (
    user_id VARCHAR(255) PRIMARY KEY,
    can_view_contracts BOOLEAN NOT NULL DEFAULT TRUE,
    can_view_receipts BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recibos y liquidaciones. contract_id / payment_id sin FK: el recibo es un documento
-- historico y tiene que seguir existiendo aunque se borre el contrato o el pago.
CREATE TABLE IF NOT EXISTS receipt (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    receipt_number VARCHAR(30) NOT NULL,
    issuer VARCHAR(20) NOT NULL,          -- INMOBILIARIA | CORREDOR
    kind VARCHAR(20) NOT NULL,            -- RECIBO | LIQUIDACION (no valido como recibo)
    concept VARCHAR(20) NOT NULL,         -- ALQUILER | EXPENSAS | SERVICIOS | OTRO
    status VARCHAR(20) NOT NULL DEFAULT 'EMITIDO',  -- EMITIDO | ANULADO
    issue_date DATE NOT NULL,
    period_month INT NULL,
    period_year INT NULL,
    currency VARCHAR(5) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    total_in_words VARCHAR(500) NOT NULL,
    payer_name VARCHAR(255) NOT NULL,
    payer_dni VARCHAR(30) NULL,
    owner_name VARCHAR(255) NULL,
    property_address VARCHAR(500) NULL,
    notes VARCHAR(2000) NULL,
    user_id VARCHAR(255) NULL,
    contract_id BIGINT NULL,
    payment_id BIGINT NULL,
    created_at DATETIME NOT NULL,
    annulled_at DATETIME NULL,
    annul_reason VARCHAR(500) NULL,
    UNIQUE KEY uk_receipt_number (receipt_number),
    KEY idx_receipt_user (user_id),
    KEY idx_receipt_contract (contract_id),
    KEY idx_receipt_issue_date (issue_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS receipt_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    receipt_id BIGINT NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    item_order INT NOT NULL,
    FOREIGN KEY (receipt_id) REFERENCES receipt(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Numeracion correlativa por emisor y tipo (LO-R-000001, OB-L-000001, ...)
CREATE TABLE IF NOT EXISTS receipt_sequence (
    sequence_key VARCHAR(50) PRIMARY KEY,
    last_number BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO receipt_sequence (sequence_key, last_number) VALUES
    ('INMOBILIARIA_RECIBO', 0),
    ('INMOBILIARIA_LIQUIDACION', 0),
    ('CORREDOR_RECIBO', 0),
    ('CORREDOR_LIQUIDACION', 0);

-- PDF original del contrato (privado, no va al blob publico de imagenes)
CREATE TABLE IF NOT EXISTS contract_document (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    content LONGBLOB NOT NULL,
    uploaded_at DATETIME NOT NULL,
    UNIQUE KEY uk_contract_document (contract_id),
    FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos del contrato que no tienen campo propio (dia de pago, punitorios, etc.)
CREATE TABLE IF NOT EXISTS contract_extra_field (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_value VARCHAR(2000) NOT NULL,
    item_order INT NOT NULL,
    KEY idx_extra_field_contract (contract_id),
    FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
