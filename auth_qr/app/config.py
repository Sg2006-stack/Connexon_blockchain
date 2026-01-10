import os
from typing import List

REQUIRED_ENV_VARS = [
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "JWT_SECRET",
    "JWT_ALGO",
    "QR_SECRET_KEY"
]

def validate_env_vars() -> None:
    missing = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    # Log presence (not values)
    present = [var for var in REQUIRED_ENV_VARS if os.getenv(var)]
    print(f"Environment check: {len(present)}/{len(REQUIRED_ENV_VARS)} required vars present.")
    if missing:
        print(f"Missing: {', '.join(missing)}")

def get_env_var(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(f"Environment variable {name} is not set")
    return value