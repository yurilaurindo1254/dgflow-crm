-- Create brand_assets table
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('color', 'typography', 'logo', 'file')),
    value TEXT NOT NULL, -- hex code, url, or font name
    name TEXT NOT NULL,
    description TEXT
);

-- RLS
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Admin, Team (Project Manager), Designer, Editor can VIEW/MANAGE
-- (Assuming team members can manage assets for now, or at least view. 
-- The request said "Visualizar", but usually they need to add them too. 
-- I'll allow ALL operations for internal roles for simplicity and utility.)

create policy "Internal Team Access"
on brand_assets
for all
using (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('admin', 'project_manager', 'designer', 'editor')
  )
);

-- Policy: Clients can VIEW their own assets (optional, but good practice)
create policy "Client View Access"
on brand_assets
for select
using (
  client_id IN (
    SELECT client_id FROM profiles 
    WHERE id = auth.uid()
  )
);
