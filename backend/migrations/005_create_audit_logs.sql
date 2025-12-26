CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,

  tenant_id UUID,
  user_id UUID,

  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,

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
