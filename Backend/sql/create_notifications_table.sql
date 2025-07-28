-- Script tạo table notifications trong PostgreSQL
-- Chạy script này trong Supabase SQL Editor hoặc PostgreSQL client

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'order', 'message', 'payment', 'review', 'gig_approved', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional data specific to notification type
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Create trigger to update updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) if using Supabase
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Supabase
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Only allow system/backend to insert notifications (no direct user insert)
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Create notification types enum for reference (optional)
CREATE TYPE notification_type AS ENUM (
    'order_received',
    'order_accepted', 
    'order_rejected',
    'order_delivered',
    'order_completed',
    'order_cancelled',
    'payment_received',
    'review_received',
    'gig_approved',
    'gig_rejected',
    'message_received',
    'system_announcement'
);

-- Comment for documentation
COMMENT ON TABLE notifications IS 'Table to store user notifications';
COMMENT ON COLUMN notifications.type IS 'Type of notification: order, message, payment, review, etc.';
COMMENT ON COLUMN notifications.data IS 'Additional JSON data specific to notification type';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read by the user';
