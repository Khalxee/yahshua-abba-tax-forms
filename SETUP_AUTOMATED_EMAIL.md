# Quick Setup Guide for Automated Email

## Complete these steps to get automated email working:

### 1. Create Supabase Project
- Go to: https://supabase.com/dashboard
- Click "New Project"
- Name: "YAHSHUA Tax Forms"
- Set password and create

### 2. Get API Details
After project is ready:
- Copy Project URL (https://[id].supabase.co)
- Go to Settings > API
- Copy "anon public" key

### 3. Update Your Files
Replace content in these files:

**File: `.env`**
```
VITE_SUPABASE_PROJECT_ID="your-new-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-new-anon-key"
VITE_SUPABASE_URL="https://your-new-id.supabase.co"
```

**File: `src/integrations/supabase/client.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://your-new-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-new-anon-key";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### 4. Deploy Edge Function
In Supabase Dashboard:
- Go to Edge Functions
- Create new function: "send-taxpayer-form" 
- Copy the code from: supabase/functions/send-taxpayer-form/index.ts
- Deploy

### 5. Set Environment Variables
In Supabase Dashboard:
- Go to Settings > Environment Variables
- Add: RESEND_API_KEY = [get from resend.com - free tier available]

### 6. Test
- Restart your dev server
- Fill out form at http://localhost:8080/
- Click submit - email should send automatically!

## Alternative: Quick Deploy via CLI
```bash
cd "/users/beverlybabida/desktop/bbc projects/yahshuatax-form-interactive-main"
supabase login
supabase link --project-ref your-new-project-id
supabase functions deploy send-taxpayer-form
```