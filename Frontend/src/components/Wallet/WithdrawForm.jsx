// src/components/Wallet/WithdrawForm.jsx
import React, { useState } from 'react';
import { Button, Input, Form, message } from 'antd';
import { DollarOutlined, ArrowUpOutlined, SafetyOutlined, CheckCircleOutlined, InfoCircleOutlined, QuestionCircleOutlined, MessageOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const WithdrawForm = ({ token, authUser, updateUser, onTransactionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const currentBalance = parseFloat(authUser?.balance || 0);

  const handleWithdraw = async (values) => {
    try {
      setLoading(true);
      const { amount } = values;
      
      if (!token) {
        message.error('You must be logged in to withdraw');
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

      const response = await fetch(`${window.BASE_API || 'http://localhost:8000'}/api/transactions/withdraw`, {
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

      // Cập nhật user info trong context
      const { user: updatedUser } = data;
      updateUser(updatedUser);

      message.success(`Successfully withdrew $${amount}! Your new balance is $${updatedUser.balance.toFixed(2)}`);
      
      // Reset form
      form.resetFields();
      
      // Notify parent component to refresh transaction history
      if (onTransactionComplete) {
        onTransactionComplete();
      }
      
    } catch (error) {
      console.error('Error withdrawing:', error);
      message.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Withdraw Form */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <ArrowUpOutlined className="text-xl text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Withdraw Amount</h2>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleWithdraw}
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-gray-700 font-semibold">Withdrawal Amount</span>}
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
                prefix={<DollarOutlined className="text-gray-400" />}
                placeholder="Enter amount to withdraw"
                type="number"
                step="0.01"
                min="0.01"
                max={currentBalance}
                size="large"
                className="text-xl font-semibold"
                style={{ height: '60px', fontSize: '18px' }}
              />
            </Form.Item>

            {/* Quick Amount Buttons */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">Quick Select:</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '25%', value: currentBalance * 0.25 },
                  { label: '50%', value: currentBalance * 0.5 },
                  { label: '75%', value: currentBalance * 0.75 },
                  { label: 'All', value: currentBalance }
                ].map((option) => (
                  <Button
                    key={option.label}
                    className="h-12 text-lg font-semibold border-2 hover:border-red-400 transition-all duration-200"
                    disabled={option.value <= 0}
                    onClick={() => {
                      form.setFieldsValue({ amount: option.value.toFixed(2) });
                      form.validateFields(['amount']);
                    }}
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
                loading={loading}
                disabled={currentBalance <= 0}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-500 to-orange-600 border-0 hover:from-red-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200"
                icon={<SafetyOutlined />}
              >
                {loading ? 'Processing...' : 'Withdraw Funds'}
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Security & Info Section */}
        <div className="space-y-6">
          {/* Warning Notice */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <ExclamationCircleOutlined className="text-xl text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Important Notice</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <ExclamationCircleOutlined className="text-yellow-500 mr-2" />
                <span>Withdrawals are processed instantly</span>
              </div>
              <div className="flex items-center text-gray-700">
                <ExclamationCircleOutlined className="text-yellow-500 mr-2" />
                <span>This action cannot be undone</span>
              </div>
              <div className="flex items-center text-gray-700">
                <ExclamationCircleOutlined className="text-yellow-500 mr-2" />
                <span>Ensure correct amount before confirming</span>
              </div>
            </div>
          </div>

          {/* Withdraw Limits */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <InfoCircleOutlined className="text-xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Withdrawal Info</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available balance:</span>
                <span className="font-semibold text-gray-800">${currentBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Minimum withdraw:</span>
                <span className="font-semibold text-gray-800">$0.01</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing time:</span>
                <span className="font-semibold text-green-600">Instant</span>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <QuestionCircleOutlined className="text-xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Need Help?</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Our support team is available 24/7 to assist you with any questions about withdrawals or your wallet.
            </p>
            <Button 
              type="default" 
              className="border-purple-300 text-purple-600 hover:border-purple-400 hover:text-purple-700"
              icon={<MessageOutlined />}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawForm;
