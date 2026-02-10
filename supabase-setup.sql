-- Create ssdown_contacts table for storing contact form submissions
CREATE TABLE IF NOT EXISTS ssdown_contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_ssdown_contacts_email ON ssdown_contacts(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_ssdown_contacts_created_at ON ssdown_contacts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE ssdown_contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for contact form)
CREATE POLICY "Allow public inserts" ON ssdown_contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow reads only for authenticated users (optional, adjust as needed)
-- If you want to allow only authenticated users to read, uncomment this:
-- CREATE POLICY "Allow authenticated reads" ON ssdown_contacts
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- If you want to allow service role to read all (for admin panel), uncomment this:
-- CREATE POLICY "Allow service role reads" ON ssdown_contacts
--   FOR SELECT
--   TO service_role
--   USING (true);

