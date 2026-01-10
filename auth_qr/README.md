# QR Auth Backend

A FastAPI-based authentication system using QR codes for user verification.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file with required environment variables:
   ```
   MONGO_URI=mongodb://localhost:27017
   JWT_SECRET=your_jwt_secret_here
   JWT_ALGO=HS256
   QR_SECRET_KEY=your_32_byte_base64_encoded_key_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=secure_password
   ```

## Simple Run Options

### Option 1: Double-click `run.bat` (Windows)
- Just double-click the `run.bat` file in the project folder
- Automatically sets up everything and starts the server

### Option 2: Use VS Code Tasks
- Press `Ctrl+Shift+P`
- Type "Tasks: Run Task"
- Select "Run QR Auth App"

### Option 3: Run script
```bash
./run.sh
```

### Option 4: Manual command (from project folder)
```bash
PYTHONPATH=. .venv/Scripts/python.exe -m uvicorn app.main:app --reload
```

The server will run on `http://127.0.0.1:8000`

## API Endpoints

- `POST /user/register` - Register a new user and generate QR code
- `POST /admin/register` - Register a new admin user
- `POST /admin/login` - Admin login (returns JWT token)
- `POST /admin/verify-qr` - Verify QR code (requires Bearer token)

## Security Notes

- All required environment variables are validated at startup
- JWT tokens use proper expiration
- QR data is encrypted with Fernet
- Admin endpoints require Bearer token authentication