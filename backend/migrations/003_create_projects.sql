CREATE TABLE projects (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'completed')),

  created_by UUID,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_projects_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_projects_creator
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_projects_tenant_id
ON projects(tenant_id);
