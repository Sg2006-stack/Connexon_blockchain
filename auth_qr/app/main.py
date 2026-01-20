from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routes import user, admin
from app.config import validate_env_vars
from app.database import supabase

validate_env_vars()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        result = supabase.table("users").select("id").limit(1).execute()
        print("Supabase connection successful")
    except Exception as e:
        print(f"Supabase connection failed: {e}")
    yield
    pass

app = FastAPI(title="QR Auth Backend - SafeHer", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/user")
app.include_router(admin.router, prefix="/admin")

app.mount("/qr", StaticFiles(directory="qr_codes"), name="qr")
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
