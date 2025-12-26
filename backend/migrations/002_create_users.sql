CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID,

  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,

  role VARCHAR(20) NOT NULL
    CHECK (role IN ('super_admin', 'tenant_admin', 'user')),

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

  CONSTRAINT unique_tenant_email
    UNIQUE (tenant_id, email)
);
