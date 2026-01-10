"""
Check what's in the emergency_alerts table
"""
from supabase import create_client
from dotenv import load_dotenv
import os
import json

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("=" * 60)
print("CHECKING EMERGENCY ALERTS IN SUPABASE")
print("=" * 60)
print()

try:
    # Fetch all alerts
    result = supabase.table("emergency_alerts").select("*").order("created_at", desc=True).execute()
    
    if result.data:
        print(f"✅ Found {len(result.data)} emergency alerts\n")
        print("-" * 60)
        
        for i, alert in enumerate(result.data, 1):
            print(f"\nAlert #{i}:")
            print(json.dumps(alert, indent=2, default=str))
            print("-" * 60)
    else:
        print("❌ No emergency alerts found in database")
        print("\nTroubleshooting:")
        print("1. Check if emergency_alerts table exists in Supabase")
        print("2. Verify ESP32 is writing to the correct table")
        print("3. Check table name matches exactly (case-sensitive)")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\nPossible causes:")
    print("1. Table 'emergency_alerts' doesn't exist")
    print("2. Supabase credentials are incorrect")
    print("3. Network/connection issue")

print("\n" + "=" * 60)
