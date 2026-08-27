# Supabase Setup for GaneshUsthav

> Important: the admin editor and public view must use the same Supabase project.
> If the browser reports `PGRST205` or updates are visible only to the admin browser,
> run the repair block in section 5 in the Supabase SQL Editor.

## 1. Create Tables in Supabase SQL Editor

Run these SQL commands in your Supabase project's SQL Editor:

```sql
-- Donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  mobile TEXT,
  amount TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gallery images table
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event details table
CREATE TABLE event_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date TEXT,
  immersion_date TEXT,
  cultural_date TEXT,
  cultural_time TEXT,
  venue TEXT,
  contact TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dynamic event schedule rows
CREATE TABLE event_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event expenditures
CREATE TABLE expenditures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cost TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for public read access
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public can read donations
CREATE POLICY "Public can read donations" ON donations
  FOR SELECT USING (true);

-- Public can read members
CREATE POLICY "Public can read members" ON members
  FOR SELECT USING (true);

-- Public can read gallery
CREATE POLICY "Public can read gallery" ON gallery_images
  FOR SELECT USING (true);

-- Public can read event details
CREATE POLICY "Public can read event_details" ON event_details
  FOR SELECT USING (true);

CREATE POLICY "Public can read event rows" ON event_rows
  FOR SELECT USING (true);

CREATE POLICY "Public can read expenditures" ON expenditures
  FOR SELECT USING (true);

-- Only admins can insert/update donations
CREATE POLICY "Admins can manage donations" ON donations
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Only admins can manage members
CREATE POLICY "Admins can manage members" ON members
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Only admins can manage gallery
CREATE POLICY "Admins can manage gallery" ON gallery_images
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Only admins can manage event details
CREATE POLICY "Admins can manage event_details" ON event_details
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage event rows" ON event_rows
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage expenditures" ON expenditures
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));
```

## 2. Insert Default Event Details

```sql
INSERT INTO event_details (
  event_date,
  immersion_date,
  cultural_date,
  cultural_time,
  venue,
  contact
)
VALUES (
  '06 September 2026',
  '11 September 2026',
  '12 September 2026',
  '06:30 PM',
  'Gandhinagar, Vijayaarai',
  '+91 98765 43210'
);
```

If the `event_details` table already exists, add the new columns with:

```sql
ALTER TABLE event_details
  ADD COLUMN IF NOT EXISTS cultural_date TEXT,
  ADD COLUMN IF NOT EXISTS cultural_time TEXT;

UPDATE event_details
SET cultural_date = '12 September 2026',
    cultural_time = '06:30 PM'
WHERE cultural_date IS NULL OR cultural_time IS NULL;
```

## 3. Setup Supabase Storage

- Go to Storage in Supabase dashboard
- Create a new bucket called `gallery`
- Set it to Public

Then run this SQL to allow public image reads and authenticated admins to upload:

```sql
DROP POLICY IF EXISTS "Public can read gallery files" ON storage.objects;
CREATE POLICY "Public can read gallery files" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admins can upload gallery files" ON storage.objects;
CREATE POLICY "Admins can upload gallery files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'gallery'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
```

## 4. Create Admin User

In your Supabase project:
- Go to Authentication > Users
- Create a new user with email and password
- Note the user UUID
- Go to SQL Editor and run:

```sql
INSERT INTO admin_users (id, username, email)
VALUES ('1decac61-b12c-4f9f-8c83-c3718958b19d', 'admin', 'rathnachowdary007@gmail.com');
```

Replace `USER_UUID_HERE` with the actual UUID from the created user.

## 5. Quick Repair for Missing Tables and Policies

If the app reports that `public.event_details`, `public.members`, or
`public.gallery_images` does not exist, run this block in the Supabase SQL Editor.
It is safe to run when the tables already exist. It also replaces the relevant
read and admin policies so updates made in the admin editor are visible publicly:

```sql
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date TEXT,
  immersion_date TEXT,
  cultural_date TEXT,
  cultural_time TEXT,
  venue TEXT,
  contact TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  mobile TEXT,
  amount TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenditures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cost TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read members" ON members;
CREATE POLICY "Public can read members" ON members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read gallery" ON gallery_images;
CREATE POLICY "Public can read gallery" ON gallery_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read event_details" ON event_details;
CREATE POLICY "Public can read event_details" ON event_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage members" ON members;
CREATE POLICY "Admins can manage members" ON members FOR ALL USING (
  auth.role() = 'authenticated'
  AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
) WITH CHECK (
  auth.role() = 'authenticated'
  AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage gallery" ON gallery_images;
CREATE POLICY "Admins can manage gallery" ON gallery_images FOR ALL USING (
  auth.role() = 'authenticated'
  AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
) WITH CHECK (
  auth.role() = 'authenticated'
  AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage event_details" ON event_details;
CREATE POLICY "Admins can manage event_details" ON event_details FOR ALL USING (
  auth.role() = 'authenticated'
  AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
) WITH CHECK (
  auth.role() = 'authenticated'
  AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Public can read donations" ON donations;
CREATE POLICY "Public can read donations" ON donations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage donations" ON donations;
CREATE POLICY "Admins can manage donations" ON donations
  FOR ALL USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  ) WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Public can read expenditures" ON expenditures;
CREATE POLICY "Public can read expenditures" ON expenditures
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage expenditures" ON expenditures;
CREATE POLICY "Admins can manage expenditures" ON expenditures
  FOR ALL USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  ) WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
```

Make sure the Supabase Auth user's UUID is present in `admin_users` before
adding donations or expenditures.
