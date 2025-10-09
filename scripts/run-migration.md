# Running the Database Migration

Since `psql` is not installed locally, you'll need to run the migration using the Supabase Dashboard.

## Steps:

1. **Go to your Supabase Dashboard:**
   - Visit https://supabase.com/dashboard
   - Select your project: `hdhacuarajuyujiolaye`

2. **Open the SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy and paste the contents of `scripts/init_db.sql`:**
   - Open `/Users/ahyoungyoo/chatgpt-analytics/scripts/init_db.sql`
   - Copy all the contents
   - Paste into the SQL Editor

4. **Run the migration:**
   - Click "Run" or press `Cmd + Enter`
   - Wait for the migration to complete
   - You should see a success message

5. **Create the storage bucket for exports:**
   - Go to "Storage" in the left sidebar
   - Click "Create bucket"
   - Name: `exports`
   - Public bucket: Yes
   - Click "Create bucket"

## Alternative: Use Supabase CLI

If you want to use the CLI (optional):

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref hdhacuarajuyujiolaye

# Run the migration
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.hdhacuarajuyujiolaye.supabase.co:5432/postgres"
```

Or simply run:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.hdhacuarajuyujiolaye.supabase.co:5432/postgres" < scripts/init_db.sql
```

Replace `[YOUR-PASSWORD]` with your Supabase database password.
