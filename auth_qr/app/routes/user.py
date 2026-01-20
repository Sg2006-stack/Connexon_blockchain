from fastapi import APIRouter, HTTPException
from app.models import UserCreate, UserLogin, EmergencyAlert
from app.database import users_collection, emergency_alerts_collection
from app.qr_utils import encrypt_data, generate_qr
from datetime import datetime

router = APIRouter()

@router.post("/register")
def register_user(user: UserCreate):
    try:
        user_data = user.dict()
        
        existing_user = users_collection.find_one({"email": user_data["email"]})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")

        encrypted = encrypt_data(user_data)

        result = users_collection.insert_one({
            **user_data,
            "encrypted_qr": encrypted
        })

        try:
            qr_path = generate_qr(encrypted, str(result.inserted_id))
            users_collection.update_one(
                {"id": result.inserted_id},
                {"$set": {"qr_path": qr_path}}
            )
        except Exception as e:
            qr_path = None
            print(f"QR generation failed: {e}")

        return {
            "message": "User registered",
            "user_id": str(result.inserted_id),
            "qr_path": qr_path,
            "encrypted_qr": encrypted
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/login")
def login_user(credentials: UserLogin):
    try:
        user = users_collection.find_one({
            "email": credentials.email,
            "phone": credentials.phone
        })
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials. Please check your email and phone number.")
        
        return {
            "message": "Login successful",
            "user": {
                "id": str(user.get("_id", user.get("id", ""))),
                "name": user.get("name"),
                "email": user.get("email"),
                "phone": user.get("phone"),
                "voter_id": user.get("voter_id"),
                "pan_id": user.get("pan_id"),
                "qr_path": user.get("qr_path"),
                "encrypted_qr": user.get("encrypted_qr")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.post("/emergency-alert")
def create_emergency_alert(alert: EmergencyAlert):
    try:
        user = users_collection.find_one({"email": alert.user_email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        alert_data = {
            **alert.dict(),
            "created_at": datetime.utcnow().isoformat(),
            "resolved": False
        }
        
        result = emergency_alerts_collection.insert_one(alert_data)
        
        return {
            "message": "Emergency alert created",
            "alert_id": str(result.inserted_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating alert: {str(e)}")
