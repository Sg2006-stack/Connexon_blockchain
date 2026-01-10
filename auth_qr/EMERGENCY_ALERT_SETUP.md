# Emergency Alert System - Setup Guide

## Overview
The Abhaya platform now includes an **Emergency Alert System** that allows users to send SOS alerts with their location, photos, audio messages, and text to the admin dashboard in real-time.

## Features
- 📍 **Live Location Tracking** - GPS coordinates sent with every alert
- 📷 **Photo Evidence** - Upload emergency photos to Supabase Storage
- 🎤 **Audio Messages** - Record and send voice messages
- 💬 **Text Messages** - Include written descriptions
- ⏱️ **Timestamps** - Track when alerts were created
- ✅ **Alert Management** - Admins can mark alerts as resolved

## Setup Instructions

### 1. Supabase Database Setup

Run the SQL script to create the emergency_alerts table:

```sql
-- Go to Supabase Dashboard > SQL Editor and run:
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    audio_url TEXT,
    photo_url TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_emergency_alerts_user_email ON emergency_alerts(user_email);
CREATE INDEX idx_emergency_alerts_created_at ON emergency_alerts(created_at DESC);
CREATE INDEX idx_emergency_alerts_resolved ON emergency_alerts(resolved);
```

### 2. Supabase Storage Setup

1. Go to **Supabase Dashboard > Storage**
2. Create a new bucket called `sos-media`
3. Make it **public** (or configure appropriate access policies)
4. Create two folders inside:
   - `photos/` - for emergency images
   - `audio/` - for voice recordings

### 3. Upload Files to Storage

When a user triggers an emergency:

```javascript
// Example: Upload photo to Supabase
const { data, error } = await supabase
  .storage
  .from('sos-media')
  .upload(`photos/emergency_${Date.now()}.jpg`, photoFile)

// Get public URL
const photoUrl = `photos/emergency_${Date.now()}.jpg`
```

### 4. Create Emergency Alert

Send a POST request to create an alert:

```bash
POST http://127.0.0.1:8000/user/emergency-alert
Content-Type: application/json

{
  "user_email": "user@example.com",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "photo_url": "photos/emergency_photo_123.jpg",
  "audio_url": "audio/emergency_audio_123.mp3",
  "message": "Emergency! Need help at this location."
}
```

## Admin Dashboard Features

### Viewing Alerts
- Admins see all emergency alerts in real-time on the right sidebar
- Active alerts are highlighted in red
- Resolved alerts appear faded

### Alert Information Displayed
- 👤 **User Name** - Who sent the alert
- 📅 **Timestamp** - When the alert was created
- 📍 **Location** - Clickable Google Maps link
- 📞 **Phone Number** - User's contact number
- 💬 **Message** - Text description (if provided)
- 📷 **Photo** - Clickable image preview
- 🎤 **Audio** - Playable audio player

### Resolving Alerts
- Click the ✓ button on any alert to mark it as resolved
- Resolved alerts are moved to the bottom and faded

## API Endpoints

### Create Emergency Alert
```
POST /user/emergency-alert
```

**Request Body:**
```json
{
  "user_email": "string (required)",
  "latitude": "number (required)",
  "longitude": "number (required)",
  "photo_url": "string (optional)",
  "audio_url": "string (optional)",
  "message": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Emergency alert created",
  "alert_id": "123"
}
```

### Get All Emergency Alerts (Admin Only)
```
GET /admin/emergency-alerts
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "alerts": [
    {
      "id": 1,
      "user_email": "user@example.com",
      "user_name": "John Doe",
      "user_phone": "+1234567890",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "photo_url": "photos/photo.jpg",
      "audio_url": "audio/audio.mp3",
      "message": "Emergency message",
      "created_at": "2026-01-10T12:00:00Z",
      "resolved": false
    }
  ]
}
```

### Resolve Alert (Admin Only)
```
POST /admin/emergency-alerts/{alert_id}/resolve
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "message": "Alert resolved"
}
```

## Testing

Run the test script:

```bash
cd auth_qr
python test_emergency_alert.py
```

## File Locations

- **Backend Routes:** `app/routes/admin.py`, `app/routes/user.py`
- **Models:** `app/models.py`
- **Database:** `app/database.py`
- **Frontend:** `frontend-react/src/pages/AdminPortal.jsx`
- **Styles:** `frontend-react/src/pages/AdminPortal.css`
- **SQL Setup:** `supabase_emergency_alerts_setup.sql`
- **Test Script:** `test_emergency_alert.py`

## Integration with Mobile/User App

To integrate with a user-facing mobile app:

1. **Capture Location** - Get GPS coordinates using device API
2. **Record Audio/Photo** - Use device camera/microphone
3. **Upload to Supabase** - Upload media files to sos-media bucket
4. **Send Alert** - POST to /user/emergency-alert endpoint
5. **Real-time Updates** - Alerts appear instantly on admin dashboard

## Security Notes

- ✅ Admin endpoints require JWT authentication
- ✅ User email validation ensures only registered users can create alerts
- ⚠️ Consider adding rate limiting to prevent abuse
- ⚠️ Implement proper file upload validation (size, type)
- ⚠️ Add RLS (Row Level Security) policies in Supabase for production

## Future Enhancements

- [ ] WebSocket/Real-time subscriptions for instant notifications
- [ ] SMS/Email notifications to admins
- [ ] Alert priority levels (low, medium, high, critical)
- [ ] Geofencing and proximity alerts
- [ ] Alert history and analytics
- [ ] Multi-admin assignment and tracking
