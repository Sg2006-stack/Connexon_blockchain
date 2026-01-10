import os
import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.config import get_env_var

JWT_SECRET = get_env_var("JWT_SECRET")
JWT_ALGO = get_env_var("JWT_ALGO")

def hash_password(password: str) -> str:
    # Truncate password to 72 bytes for bcrypt compatibility
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Truncate plain password to 72 bytes for bcrypt compatibility
    password_bytes = plain_password.encode('utf-8')[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))

def create_jwt():
    payload = {
        "role": "admin",
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
