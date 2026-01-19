-- Migration: Setup RBAC Roles and Policies

-- 1. Create User Role Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'project_manager', 'designer', 'editor', 'client');
    ELSE
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'project_manager';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'designer';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';
    END IF;
END$$;

-- 2. Update Profiles Table
ALTER TABLE profiles 
    ALTER COLUMN role TYPE user_role USING role::user_role;

-- 3. RLS Policies

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- FINANCE
DROP POLICY IF EXISTS "Finance Access" ON transactions;
CREATE POLICY "Finance Access" ON transactions
    FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Invoices Access" ON invoices;
CREATE POLICY "Invoices Access" ON invoices
    FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- TASKS
DROP POLICY IF EXISTS "Tasks Access" ON tasks;
CREATE POLICY "Tasks Access" ON tasks
    FOR ALL
    USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'project_manager'))
        OR
        assignee_id = auth.uid()
    );

-- PROJECTS
DROP POLICY IF EXISTS "Projects Access" ON projects;
CREATE POLICY "Projects Access" ON projects
    FOR SELECT
    USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'project_manager'))
        OR
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.project_id = projects.id 
            AND tasks.assignee_id = auth.uid()
        )
    );

CREATE POLICY "Projects Write Access" ON projects
    FOR INSERT 
    WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'project_manager')));

CREATE POLICY "Projects Update Access" ON projects
    FOR UPDATE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'project_manager')));

CREATE POLICY "Projects Delete Access" ON projects
    FOR DELETE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'project_manager')));
