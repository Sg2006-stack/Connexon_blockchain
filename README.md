# Blockchain based encrypted full stack system for a Women safety IoT Device

A comprehensive full-stack system for secure user authentication via QR codes, IoT device data collection, and real-time visualization. Built with FastAPI backend and React frontend, designed for a women's safety monitoring device.

## Overview

This project provides:

- **QR Code Authentication**: Secure QR-based authentication system for users and administrators
- **IoT Data Collection**: Receives and processes data from IoT devices using ThingSpeak
- **Real-time Dashboard**: Interactive web interface to visualize device data and user information
- **Admin Portal**: Comprehensive admin panel for user management and device monitoring
- **User Portal**: Personal dashboard for users to manage their devices and view their activity

## Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React with Vite
- **Database**: SupabaseDb
- **Authentication**: JWT + QR Code verification
- **Data Visualization**: Interactive charts and real-time updates

## Features

### Authentication System
- QR code generation and verification
- JWT-based session management
- Separate user and admin authentication flows
- Secure credential storage

### IoT Integration
- Receive sensor data from IoT devices
- Store device metrics and telemetry
- Support for multiple device types
- Real-time data processing

### Web Dashboard
- User registration and device management
- Admin portal for system oversight
- Real-time data visualization
- User activity tracking and reporting

## Project Structure

```
auth_qr/
├── app/                      # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── config.py           # Configuration management
│   ├── database.py         # Database connection
│   ├── models.py           # Data models
│   ├── auth_utils.py       # Authentication utilities
│   ├── qr_utils.py         # QR code utilities
│   └── routes/             # API endpoints
│       ├── user.py         # User endpoints
│       └── admin.py        # Admin endpoints
├── frontend-react/          # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   └── App.jsx         # Main app component
│   └── package.json
├── qr_codes/               # Generated QR code storage
└── requirements.txt        # Python dependencies
```

## Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB (local or cloud instance)

### Installation

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend-react
   npm install
   ```

3. Create a `.env` file in the `auth_qr` directory with required environment variables:
   ```
   MONGO_URI=mongodb://localhost:27017
   JWT_SECRET=your_jwt_secret_here
   JWT_ALGO=HS256
   QR_SECRET_KEY=your_32_byte_base64_encoded_key_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=secure_password
   ```

## Running the Application

### Option 1: Double-click `run.bat` (Windows)
- Simply double-click the `run.bat` file in the project folder
- Automatically sets up everything and starts the server

### Option 2: Use VS Code Tasks
- Press `Ctrl+Shift+P`
- Type "Tasks: Run Task"
- Select "Run QR Auth App"

### Option 3: Run shell script
```bash
./run.sh
```

### Option 4: Manual command (from project folder)
```bash
PYTHONPATH=. .venv/Scripts/python.exe -m uvicorn app.main:app --reload
```

The backend server will run on `http://127.0.0.1:8000`

### Running the Frontend
```bash
cd frontend-react
npm run dev
```

The frontend will be available on `http://localhost:5173`

## API Endpoints

### User Endpoints
- `POST /user/register` - Register a new user and generate QR code
- `GET /user/profile` - Get user profile information
- `GET /user/devices` - List user's registered devices
- `POST /user/device/register` - Register a new IoT device

### Admin Endpoints
- `POST /admin/register` - Register a new admin user
- `POST /admin/login` - Admin login (returns JWT token)
- `POST /admin/verify-qr` - Verify QR code (requires Bearer token)
- `GET /admin/users` - List all users
- `GET /admin/devices` - List all registered devices
- `GET /admin/data` - Get aggregated IoT device data

### Data Endpoints
- `POST /data/submit` - Submit IoT device data
- `GET /data/device/{device_id}` - Get data for specific device
- `GET /data/analytics` - Get analytics and statistics

## How It Works

### Authentication Flow
1. User registers and receives a QR code
2. QR code contains encrypted user credentials
3. Admin or user scans QR code for verification
4. System validates QR code and issues JWT token
5. JWT token used for subsequent API requests

### IoT Data Flow
1. IoT devices collect sensor data (location, status, metrics)
2. Devices submit data to `/data/submit` endpoint
3. Backend validates device ownership and stores data
4. Frontend retrieves and displays data in real-time
5. Admin dashboard shows aggregated insights across all devices

## Security

- JWT tokens for API authentication
- QR code encryption for sensitive data
- MongoDB connection validation
- Admin-only endpoints protected with Bearer tokens
- Environment variables for sensitive configuration

## Development

### Backend Development
```bash
# Run with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest
```

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Database Schema

The system uses MongoDB with collections for:
- **users**: User account information
- **admins**: Admin account information
- **devices**: IoT device registration and metadata
- **device_data**: Time-series sensor data and metrics
- **sessions**: Active user sessions and JWT tokens

## Future Enhancements

- Real-time WebSocket updates for device data
- Mobile app integration
- Advanced analytics and machine learning insights
- Blockchain integration for tamper-proof logging
- Multi-language support
- Two-factor authentication options

## Security Notes

- All required environment variables are validated at startup
- JWT tokens use proper expiration
- QR data is encrypted with Fernet
- Admin endpoints require Bearer token authentication