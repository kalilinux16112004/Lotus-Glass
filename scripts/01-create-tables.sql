-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  year TEXT,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  project_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions (email);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects table (publicly readable, only authenticated users can modify)
CREATE POLICY "projects_select_public" ON projects FOR SELECT USING (true);
CREATE POLICY "projects_insert_authenticated" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "projects_update_authenticated" ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "projects_delete_authenticated" ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for contact_submissions table (anyone can insert, only authenticated can view/delete)
CREATE POLICY "contact_submissions_insert_public" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_submissions_select_authenticated" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "contact_submissions_delete_authenticated" ON contact_submissions FOR DELETE USING (auth.role() = 'authenticated');
