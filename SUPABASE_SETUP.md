# Create New Supabase Project Instructions

## Step 1: Create Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization
4. Set project name: "YAHSHUA-ABBA Tax Forms"
5. Set database password (save this!)
6. Choose region closest to you
7. Click "Create new project"

## Step 2: Get Project Details
After project is created:
1. Go to Project Settings > General
2. Copy the Project URL (should be like: https://[NEW-PROJECT-ID].supabase.co)
3. Copy the Project ID 
4. Go to Project Settings > API
5. Copy the "anon public" key

## Step 3: Update Your .env File
Replace your current .env with:

VITE_SUPABASE_PROJECT_ID="[NEW-PROJECT-ID]"
VITE_SUPABASE_PUBLISHABLE_KEY="[NEW-ANON-PUBLIC-KEY]"
VITE_SUPABASE_URL="https://[NEW-PROJECT-ID].supabase.co"

## Step 4: Update Supabase Client
Update src/integrations/supabase/client.ts with the new URL and key

## Step 5: Deploy Edge Function
Use Supabase Dashboard:
1. Go to Edge Functions
2. Create new function called "send-taxpayer-form"
3. Paste the fixed code we prepared earlier
4. Deploy

## Step 6: Set Environment Variables
1. Go to Project Settings > Environment Variables  
2. Add: RESEND_API_KEY = [your-resend-api-key]

## Step 7: Test
Your form should now work perfectly!
