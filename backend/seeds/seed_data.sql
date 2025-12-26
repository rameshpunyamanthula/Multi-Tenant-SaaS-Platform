-- =====================================================
-- SEED DATA FOR MULTI-TENANT SAAS PLATFORM (IDEMPOTENT)
-- =====================================================


-- ===============================
-- 1. SUPER ADMIN (NO TENANT)
-- ===============================
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'superadmin@system.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'System Super Admin',
    'super_admin',
    TRUE
)
ON CONFLICT (id) DO NOTHING;


-- ===============================
-- 2. SAMPLE TENANT (DEMO COMPANY)
-- ===============================
INSERT INTO tenants (
    id,
    name,
    subdomain,  
    status,
    subscription_plan,
    max_users,
    max_projects
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    15
)
ON CONFLICT (id) DO NOTHING;


-- ===============================
-- 3. TENANT ADMIN (DEMO COMPANY)
-- ===============================
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'admin@demo.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Demo Tenant Admin',
    'tenant_admin',
    TRUE
)
ON CONFLICT (id) DO NOTHING;


-- ===============================
-- 4. REGULAR USERS (DEMO COMPANY)
-- ===============================
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'user1@demo.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Demo User One',
    'user',
    TRUE
),
(
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'user2@demo.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Demo User Two',
    'user',
    TRUE
)
ON CONFLICT (id) DO NOTHING;


-- ===============================
-- 5. SAMPLE PROJECTS
-- ===============================
INSERT INTO projects (
    id,
    tenant_id,
    name,
    description,
    status,
    created_by
) VALUES
(
    '66666666-6666-6666-6666-666666666666',
    '22222222-2222-2222-2222-222222222222',
    'Website Redesign',
    'Redesign the company website',
    'active',
    '33333333-3333-3333-3333-333333333333'
),
(
    '77777777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    'Mobile App Development',
    'Develop a new mobile application',
    'active',
    '33333333-3333-3333-3333-333333333333'
)
ON CONFLICT (id) DO NOTHING;


-- ===============================
-- 6. SAMPLE TASKS
-- ===============================
INSERT INTO tasks (
    id,
    project_id,
    tenant_id,
    title,
    description,
    status,
    priority,
    assigned_to
) VALUES
(
    '88888888-8888-8888-8888-888888888888',
    '66666666-6666-6666-6666-666666666666',
    '22222222-2222-2222-2222-222222222222',
    'Create wireframes',
    'Design UI wireframes',
    'todo',
    'high',
    '44444444-4444-4444-4444-444444444444'
),
(
    '99999999-9999-9999-9999-999999999999',
    '66666666-6666-6666-6666-666666666666',
    '22222222-2222-2222-2222-222222222222',
    'Setup hosting',
    'Configure hosting environment',
    'in_progress',
    'medium',
    '55555555-5555-5555-5555-555555555555'
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '77777777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    'Design app UI',
    'Create mobile UI designs',
    'todo',
    'high',
    '44444444-4444-4444-4444-444444444444'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '77777777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    'Implement authentication',
    'Add login and signup',
    'todo',
    'high',
    '33333333-3333-3333-3333-333333333333'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '77777777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    'Testing & QA',
    'Perform testing',
    'todo',
    'low',
    '55555555-5555-5555-5555-555555555555'
)
ON CONFLICT (id) DO NOTHING;
