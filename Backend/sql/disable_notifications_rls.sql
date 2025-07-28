-- Tạm thời tắt RLS để đơn giản hóa notification system
-- Chạy script này trong Supabase SQL Editor

-- Disable RLS cho table notifications
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Drop các policies hiện tại
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications; 
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Grant permissions cho anonymous role để realtime có thể hoạt động
GRANT SELECT ON notifications TO anon;
GRANT INSERT ON notifications TO anon;
GRANT UPDATE ON notifications TO anon;
GRANT DELETE ON notifications TO anon;

-- Cũng grant cho authenticated role
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Comment: RLS đã được tắt để đơn giản hóa hệ thống notification
-- Trong production, nên bật lại RLS và tạo policies phù hợp
