-- Add estimated_hours to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER DEFAULT 1;

-- Add weekly_capacity to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS weekly_capacity INTEGER DEFAULT 40;
