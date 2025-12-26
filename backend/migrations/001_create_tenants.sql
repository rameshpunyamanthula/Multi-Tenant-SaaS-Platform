CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(255) UNIQUE NOT NULL,

  status VARCHAR(20)
    CHECK (status IN ('active', 'suspended', 'trial')),

  subscription_plan VARCHAR(20)
    CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),

  max_users INTEGER,
  max_projects INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
