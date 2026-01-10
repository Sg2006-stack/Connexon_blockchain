-- Create emergency_alerts table in Supabase
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

-- Create index on user_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_email ON emergency_alerts(user_email);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON emergency_alerts(created_at DESC);

-- Create index on resolved for filtering active alerts
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_resolved ON emergency_alerts(resolved);
