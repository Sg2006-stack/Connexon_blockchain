from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models import AdminLogin, AdminCreate, EmergencyAlert
from app.database import users_collection, admins_collection, emergency_alerts_collection, sos_logs_collection
from app.qr_utils import decrypt_data
from app.auth_utils import create_jwt, verify_password, hash_password
from jose import jwt, JWTError
import os
from datetime import datetime
from app.config import get_env_var

router = APIRouter()
security = HTTPBearer()

JWT_SECRET = get_env_var("JWT_SECRET")
JWT_ALGO = get_env_var("JWT_ALGO")

def admin_guard(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register")
def register_admin(admin: AdminCreate):
    try:
        existing = admins_collection.find_one({"username": admin.username})
        if existing:
            raise HTTPException(status_code=400, detail="Admin already exists")
        
        hashed_password = hash_password(admin.password)
        admins_collection.insert_one({
            "username": admin.username,
            "password": hashed_password,
            "email": admin.email
        })
        return {"message": "Admin registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/login")
def admin_login(data: AdminLogin):
    try:
        admin = admins_collection.find_one({"username": data.username})
        if not admin or not verify_password(data.password, admin["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_jwt()
        return {"access_token": token}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/verify-qr")
def verify_qr(payload: dict, credentials: HTTPAuthorizationCredentials = Depends(security)):
    admin_guard(credentials)

    encrypted_qr = payload.get("encrypted_qr")
    if not encrypted_qr:
        raise HTTPException(status_code=400, detail="QR required")

    try:
        decrypted = decrypt_data(encrypted_qr)
        print(f"Decrypted: {decrypted}")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid QR data")

    try:
        user = users_collection.find_one({"email": decrypted["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "status": "VALID",
            "user_data": {
                "name": user["name"],
                "email": user["email"],
                "phone": user["phone"],
                "voter_id": user["voter_id"],
                "pan_id": user["pan_id"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/emergency-alerts")
def get_emergency_alerts(credentials: HTTPAuthorizationCredentials = Depends(security)):
    admin_guard(credentials)
    
    try:
        sos_logs = sos_logs_collection.find_all(order_by="created_at", desc=True, limit=50)
        
        alerts = []
        for log in sos_logs:
            photo_url = log.get("photo_url", "")
            audio_url = log.get("audio_url", "")
            
            if photo_url and "supabase.co" in photo_url:
                photo_url = photo_url.split("/sos-media/")[-1] if "/sos-media/" in photo_url else photo_url
            if audio_url and "supabase.co" in audio_url:
                audio_url = audio_url.split("/sos-media/")[-1] if "/sos-media/" in audio_url else audio_url
            
            alerts.append({
                "id": log.get("id"),
                "device_id": log.get("device_id"),
                "user_name": log.get("device_id", "Unknown Device"),
                "user_phone": "N/A",
                "user_email": f"{log.get('device_id', 'unknown')}@device.local",
                "latitude": log.get("latitude", 0),
                "longitude": log.get("longitude", 0),
                "photo_url": photo_url,
                "audio_url": audio_url,
                "message": log.get("message", f"SOS Alert from {log.get('device_id', 'device')}"),
                "created_at": log.get("created_at"),
                "resolved": log.get("resolved", False),
                "resolved_at": log.get("resolved_at")
            })
        
        return {"alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/emergency-alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    admin_guard(credentials)
    
    try:
        sos_logs_collection.update_one(
            {"id": alert_id},
            {"$set": {"resolved": True, "resolved_at": datetime.utcnow().isoformat()}}
        )
        return {"message": "Alert resolved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
