// src/pages/BecomeSellerPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, message } from 'antd';
import Navbar from '../Common/Navbar_LD'; // Đảm bảo đường dẫn đúng
// import { useAuth } from '../contexts/authContext'; // Tạm thời không cần dùng

const { TextArea } = Input;

const BecomeSellerPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { token, updateUser } = useAuth(); // Tạm thời không cần dùng

  // --- SỬA LẠI HÀM onFinish ---
  const onFinish = async (values) => {
    // 1. In ra console để xem dữ liệu form (hữu ích cho việc debug sau này)
    console.log('Form submitted with values:', values);
    
    // 2. Hiển thị trạng thái loading (tùy chọn, để trải nghiệm người dùng tốt hơn)
    setLoading(true);

    // 3. Giả lập một khoảng chờ như đang gọi API (tùy chọn)
    await new Promise(resolve => setTimeout(resolve, 500)); // Chờ 0.5 giây

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