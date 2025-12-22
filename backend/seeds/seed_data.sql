-- SUPER ADMIN (system-level)
INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'superadmin@system.com',
    '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNO1234567890abcd',
    'System Super Admin',
    'super_admin',
    TRUE
);

-- TENANT
INSERT INTO tenants (
    id, name, subdomain, status, subscription_plan, max_users, max_projects
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    15
);

-- TENANT ADMIN
INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role, is_active
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'admin@demo.com',
    '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNO1234567890abcd',
    'Demo Admin',
    'tenant_admin',
    TRUE
);

-- REGULAR USER
INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role, is_active
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'user@demo.com',
    '$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNO1234567890abcd',
    'Demo User',
    'user',
    TRUE
);

-- PROJECT
INSERT INTO projects (
    id, tenant_id, name, description, status, created_by
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'Demo Project',
    'Initial demo project',
    'active',
    '33333333-3333-3333-3333-333333333333'
);

-- TASK
INSERT INTO tasks (
    id, project_id, tenant_id, title, description, status, priority, assigned_to
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'Initial Task',
    'This is a seeded task',
    'todo',
    'medium',
    '44444444-4444-4444-4444-444444444444'
);
