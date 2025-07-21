// src/pages/WithdrawPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, message, Form, Divider } from 'antd';
import { WalletOutlined, DollarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../Common/NavBar_Buyer';

const WithdrawPage = () => {
  const { authUser, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const currentBalance = parseFloat(authUser?.balance || 0);

  const handleWithdraw = async (values) => {
    try {
      setLoading(true);
      const { amount } = values;
      
      if (!token) {
        message.error('You must be logged in to withdraw');
        navigate('/auth');
        return;
      }

      // Validation phía client
      if (amount <= 0) {
        message.error('Amount must be greater than 0');
        return;
      }

      if (amount > currentBalance) {
        message.error('Insufficient balance');
        return;
      }

      const response = await fetch('http://localhost:8000/api/transactions/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to withdraw');
      }

      // Cập nhật user info trong context (không có token mới)
      const { user: updatedUser } = data;
      updateUser(updatedUser);

      message.success(`Successfully withdrew $${amount}! Your new balance is $${updatedUser.balance.toFixed(2)}`);
      
      // Reset form
      form.resetFields();
      
    } catch (error) {
      console.error('Error withdrawing:', error);
      message.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Withdraw Funds
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Withdraw money from your wallet
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto">
          {/* Current Balance Card */}
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none">
            <div className="text-center">
              <WalletOutlined className="text-3xl mb-2" />
              <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
              <div className="text-3xl font-bold">
                ${currentBalance.toFixed(2)}
              </div>
            </div>
          </Card>

          {/* Withdraw Form */}
          <Card title={<span className="text-xl font-bold">Withdraw Amount</span>}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleWithdraw}
              requiredMark={false}
            >
              <Form.Item
                label="Amount ($)"
                name="amount"
                rules={[
                  { required: true, message: 'Please enter withdrawal amount' },
                  {
                    validator: (_, value) => {
                      const numValue = parseFloat(value);
                      if (!value || isNaN(numValue)) {
                        return Promise.reject(new Error('Please enter a valid amount'));
                      }
                      if (numValue <= 0) {
                        return Promise.reject(new Error('Amount must be greater than 0'));
                      }
                      if (numValue > currentBalance) {
                        return Promise.reject(new Error('Amount cannot exceed your current balance'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input
                  prefix={<DollarOutlined />}
                  placeholder="Enter amount to withdraw"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={currentBalance}
                  size="large"
                />
              </Form.Item>

              <Divider />

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Quick Select:</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '25%', value: currentBalance * 0.25 },
                    { label: '50%', value: currentBalance * 0.5 },
                    { label: '75%', value: currentBalance * 0.75 },
                    { label: 'All', value: currentBalance }
                  ].map((option) => (
                    <Button
                      key={option.label}
                      size="small"
                      disabled={option.value <= 0}
                      onClick={() => {
                        form.setFieldsValue({ amount: option.value.toFixed(2) });
                        // Trigger validation after setting value
                        form.validateFields(['amount']);
                      }}
                      className="text-xs"
                    >
                      {option.label} (${option.value.toFixed(2)})
                    </Button>
                  ))}
                </div>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  disabled={currentBalance <= 0}
                  className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 font-semibold"
                >
                  {loading ? 'Processing...' : 'Withdraw Funds'}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Warning Notice */}
          <Card className="mt-6 bg-yellow-50 border-yellow-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ Important Notice
              </h3>
              <p className="text-yellow-700 text-sm">
                Withdrawals are processed instantly. Please ensure you enter the correct amount 
                as this action cannot be undone.
              </p>
            </div>
          </Card>

          {/* Back Button */}
          <div className="text-center mt-8">
            <Button 
              size="large" 
              onClick={() => navigate(-1)}
              icon={<ArrowLeftOutlined />}
              className="px-8"
            >
              Back to Previous Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
