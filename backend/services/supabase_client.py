import os
from supabase import create_client, Client

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')

if supabase_url and supabase_key:
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✅ Supabase client initialized")
else:
    supabase = None
    print("⚠️ Supabase not configured - portfolio features disabled")
