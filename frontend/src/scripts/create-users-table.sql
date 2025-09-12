-- Create users table for StarProof dApp
-- This table stores wallet addresses and their associated API keys
-- Run this script in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    api_key TEXT,
    api_key_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_api_key_hash ON users(api_key_hash);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow users to read/update their own data based on wallet address
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (true); -- Allow read access for now, you can restrict this later

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (true); -- Allow insert for now

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true); -- Allow update for now

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some example data (optional)
-- INSERT INTO users (wallet_address) VALUES ('GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') ON CONFLICT DO NOTHING;