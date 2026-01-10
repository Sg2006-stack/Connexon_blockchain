import json
import os
import qrcode
from cryptography.fernet import Fernet, InvalidToken
from app.config import get_env_var

KEY_STR = get_env_var("QR_SECRET_KEY")
try:
    KEY = KEY_STR.encode()
    cipher = Fernet(KEY)
except Exception as e:
    raise ValueError(f"Invalid QR_SECRET_KEY: {e}")

def encrypt_data(data: dict) -> str:
    return cipher.encrypt(json.dumps(data).encode()).decode()

def decrypt_data(encrypted_text: str) -> dict:
    try:
        decrypted = cipher.decrypt(encrypted_text.encode())
        return json.loads(decrypted.decode())
    except InvalidToken:
        raise ValueError("Invalid encrypted QR data")

def generate_qr(encrypted_text: str, user_id: str) -> str:
    os.makedirs("qr_codes", exist_ok=True)
    path = f"qr_codes/{user_id}.png"
    img = qrcode.make(encrypted_text)
    img.save(path)
    return path
