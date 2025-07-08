// src/pages/BecomeSellerPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, message } from 'antd';
import Navbar from '../Common/Navbar_LD'; // Đảm bảo đường dẫn đúng
import { useAuth } from '../contexts/AuthContext'; // Sử dụng context để cập nhật user

const { TextArea } = Input;

const BecomeSellerPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth(); // Sử dụng context để cập nhật user

  // --- SỬA LẠI HÀM onFinish ---
  const onFinish = async (values) => {
    // 1. In ra console để xem dữ liệu form (hữu ích cho việc debug sau này)
    console.log('Form submitted with values:', values);
    
    // 2. Hiển thị trạng thái loading (tùy chọn, để trải nghiệm người dùng tốt hơn)
    setLoading(true);

    // 3. Call API to update user as seller
    try {
      const token = localStorage.getItem('token');
      if (!token) {
      message.error('You must be logged in to become a seller');
      navigate('/login');
      return;
      }
      
      const response = await fetch('http://localhost:8000/api/users/become-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          seller_headline: values.seller_headline,
          seller_description: values.seller_description
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to become a seller');
      }
      
      // Cập nhật user info trong context và localStorage
      const { user: updatedUser, token: newToken } = data;
      
      // Cập nhật localStorage với token mới
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Cập nhật context với user mới
      updateUser(updatedUser);
    } catch (error) {
      console.error('Error becoming a seller:', error);
      message.error(error.message || 'Something went wrong. Please try again.');
      setLoading(false);
      return; // Stop execution if there's an error
    }

    // 4. Hiển thị thông báo thành công (tùy chọn)
    message.success('Profile completed! Redirecting...');
    
    // 5. Chuyển hướng trực tiếp đến trang Profile_Seller
    navigate('/Profile_Seller');

    // Không cần setLoading(false) nữa vì đã chuyển trang
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-2 text-center">Become a Seller</h1>
          <p className="text-gray-600 mb-6 text-center">
            Share your skills with our community and start earning.
          </p>
          <Form
            name="become_seller"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="seller_headline"
              label="Your Professional Headline"
              rules={[{ required: true, message: 'Please input your headline!' }]}
            >
              <Input placeholder="e.g., React Developer | UI/UX Designer" />
            </Form.Item>

            <Form.Item
              name="seller_description"
              label="Describe Your Skills & Experience"
              rules={[{ required: true, message: 'Please tell us about yourself!' }]}
            >
              <TextArea rows={6} placeholder="Share details about your expertise, past projects, and what makes you a great seller." />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Complete My Seller Profile
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default BecomeSellerPage;