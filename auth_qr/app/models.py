from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    voter_id: str
    pan_id: str

class UserLogin(BaseModel):
    email: EmailStr
    phone: str

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str
    email: EmailStr

class EmergencyAlert(BaseModel):
    user_email: EmailStr
    latitude: float
    longitude: float
    audio_url: str | None = None
    photo_url: str | None = None
    message: str | None = None
