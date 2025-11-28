# Supabase client temporarily disabled to avoid dependency conflicts
# This can be re-enabled after fixing websockets/httpx version issues

# import os
# from dotenv import load_dotenv
# from supabase import create_client, Client
# 
# load_dotenv()
# 
# def get_supabase_client() -> Client:
#     url = os.getenv("SUPABASE_URL")
#     key = os.getenv("SUPABASE_KEY")
#     
#     if not url or not key:
#         raise ValueError("Supabase credentials not found")
#     
#     return create_client(url, key)
# 
# supabase = get_supabase_client()

# Placeholder - Supabase temporarily disabled
supabase = None
print("WARNING: Supabase disabled - watchlist features won't work")
