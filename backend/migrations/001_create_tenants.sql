-- UP
CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) NOT NULL UNIQUE,

    status VARCHAR(20) NOT NULL DEFAULT 'trial'
        CHECK (status IN ('active', 'suspended', 'trial')),

    subscription_plan VARCHAR(20) NOT NULL DEFAULT 'free'
        CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),

    max_users INTEGER NOT NULL DEFAULT 5,
    max_projects INTEGER NOT NULL DEFAULT 3,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS tenants;
