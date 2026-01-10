# Test Emergency Alert Endpoint
# This is a sample script to test the emergency alert creation

import requests
import json

API_BASE = "http://127.0.0.1:8000"

# Sample emergency alert data
alert_data = {
    "user_email": "test@example.com",  # Replace with actual registered user email
    "latitude": 28.6139,  # Example: New Delhi coordinates
    "longitude": 77.2090,
    "audio_url": "audio/emergency_audio_123.mp3",  # Path in Supabase storage
    "photo_url": "photos/emergency_photo_123.jpg",  # Path in Supabase storage
    "message": "Emergency! Need immediate assistance at this location."
}

def test_emergency_alert():
    """Test creating an emergency alert"""
    try:
        response = requests.post(
            f"{API_BASE}/user/emergency-alert",
            json=alert_data
        )
        
        if response.status_code == 200:
            print("✅ Emergency alert created successfully!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Failed to create alert: {response.status_code}")
            print(response.json())
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("Testing Emergency Alert Creation...")
    print("-" * 50)
    test_emergency_alert()
