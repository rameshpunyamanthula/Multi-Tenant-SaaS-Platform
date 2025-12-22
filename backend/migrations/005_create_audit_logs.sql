-- UP
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,

    tenant_id VARCHAR(36),
    user_id VARCHAR(36),

    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(36),

    ip_address VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- DOWN
DROP TABLE IF EXISTS audit_logs;
