"""
Create test emergency alerts with existing photos from Supabase storage
Run this after creating the emergency_alerts table in Supabase
"""

import requests
import json

API_BASE = "http://127.0.0.1:8000"

# Test alerts with photos that are already in your Supabase storage
test_alerts = [
    {
        "user_email": "goshshreyn212@gmail.com",  # Use a registered user email
        "latitude": 28.6139,
        "longitude": 77.2090,
        "photo_url": "photos/SOS_001_31_IMG_0001.jpg",  # Existing photo in storage
        "audio_url": None,
        "message": "Emergency situation - need immediate help!"
    },
    {
        "user_email": "goshshreyn212@gmail.com",
        "latitude": 28.6200,
        "longitude": 77.2150,
        "photo_url": "photos/SOS_001_405_IMG_0001.jpg",  # Another existing photo
        "audio_url": None,
        "message": "Urgent assistance required at this location"
    },
    {
        "user_email": "goshshreyn212@gmail.com",
        "latitude": 28.6100,
        "longitude": 77.2050,
        "photo_url": "photos/SOS_001_778_IMG_0002.jpg",
        "audio_url": None,
        "message": "Emergency alert - please respond"
    }
]

def create_test_alerts():
    """Create test emergency alerts"""
    print("Creating test emergency alerts...")
    print("-" * 60)
    
    for i, alert in enumerate(test_alerts, 1):
        try:
            response = requests.post(
                f"{API_BASE}/user/emergency-alert",
                json=alert
            )
            
            if response.status_code == 200:
                print(f"✅ Alert {i} created successfully!")
                print(f"   Location: {alert['latitude']}, {alert['longitude']}")
                print(f"   Photo: {alert['photo_url']}")
                print()
            else:
                print(f"❌ Failed to create alert {i}: {response.status_code}")
                print(f"   Error: {response.json()}")
                print()
        
        except Exception as e:
            print(f"❌ Error creating alert {i}: {str(e)}")
            print()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("EMERGENCY ALERTS TEST DATA CREATOR")
    print("="*60 + "\n")
    
    print("⚠️  PREREQUISITES:")
    print("1. Make sure the backend is running (http://127.0.0.1:8000)")
    print("2. Emergency_alerts table must exist in Supabase")
    print("3. User with email 'goshshreyn212@gmail.com' must be registered")
    print()
    
    input("Press Enter to continue...")
    print()
    
    create_test_alerts()
    
    print("="*60)
    print("✅ Done! Check the Admin Portal to see the alerts.")
    print("="*60)
