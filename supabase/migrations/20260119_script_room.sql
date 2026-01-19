-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    project_id UUID, -- Optional link to a project/task if needed later
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'filming', 'editing', 'done')),
    content JSONB DEFAULT '[]'::jsonb, -- Array of scene blocks
    estimated_time text, -- Storing as text for flexibility (e.g. "2 mins") or integer seconds
    created_by UUID REFERENCES profiles(id)
);

-- RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Policy: Admin, Team (Project Manager), Designer, Editor can VIEW/MANAGE
create policy "Internal Scripts Access"
on scripts
for all
using (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin'::user_role, 'project_manager'::user_role, 'designer'::user_role, 'editor'::user_role)
  )
);
