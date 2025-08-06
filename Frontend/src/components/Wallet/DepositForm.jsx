// src/components/Wallet/DepositForm.jsx
import React, { useState } from 'react';
import { Button, Input, Form, message } from 'antd';
import { DollarOutlined, CreditCardOutlined, SafetyOutlined, CheckCircleOutlined, InfoCircleOutlined, QuestionCircleOutlined, MessageOutlined } from '@ant-design/icons';

const DepositForm = ({ token, updateUser, onTransactionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [form] = Form.useForm();

  // Suggested amounts for quick selection
  const suggestedAmounts = [5, 10, 25, 50, 100, 200];

  const handleDeposit = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        message.error('You must be logged in to deposit');
        return;
      }

      const depositAmount = parseFloat(amount);
      
      if (!depositAmount || depositAmount <= 0) {
        message.error('Please enter a valid amount');
        setLoading(false);
        return;
      }

      if (depositAmount < 1) {
        message.error('Minimum deposit amount is $1');
        setLoading(false);
        return;
      }

      if (depositAmount > 10000) {
        message.error('Maximum deposit amount is $10,000');
        setLoading(false);
        return;
      }

      const response = await fetch(`${window.BASE_API || 'http://localhost:8000'}/api/transactions/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: depositAmount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deposit');
      }

      // Cập nhật user info trong context
      const { user: updatedUser } = data;
      updateUser(updatedUser);

      message.success(`Successfully deposited $${depositAmount}! Your new balance is $${updatedUser.balance}`);
      
      // Clear form
      setAmount('');
      form.resetFields();
      
      // Notify parent component to refresh transaction history
      if (onTransactionComplete) {
        onTransactionComplete();
      }
      
    } catch (error) {
      console.error('Error depositing:', error);
      message.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedAmount = (suggestedAmount) => {
    setAmount(suggestedAmount.toString());
    form.setFieldsValue({ amount: suggestedAmount });
  };

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Deposit Form */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <CreditCardOutlined className="text-xl text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Enter Amount</h2>
          </div>

          <Form form={form} layout="vertical" onFinish={handleDeposit}>
            <Form.Item
              name="amount"
              label={<span className="text-gray-700 font-semibold">Deposit Amount</span>}
              rules={[
                { required: true, message: 'Please enter an amount' },
                { 
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const num = parseFloat(value);
                    if (isNaN(num) || num <= 0) {
                      return Promise.reject('Please enter a valid amount');
                    }
                    if (num < 1) {
                      return Promise.reject('Minimum deposit is $1');
                    }
                    if (num > 10000) {
                      return Promise.reject('Maximum deposit is $10,000');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                size="large"
                prefix={<DollarOutlined className="text-gray-400" />}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xl font-semibold"
                style={{ height: '60px', fontSize: '18px' }}
              />
            </Form.Item>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">Quick Select:</p>
              <div className="grid grid-cols-2 gap-3">
                {suggestedAmounts.map((suggestedAmount) => (
                  <Button
                    key={suggestedAmount}
                    type={amount === suggestedAmount.toString() ? "primary" : "default"}
                    className="h-12 text-lg font-semibold border-2 hover:border-blue-400 transition-all duration-200"
                    onClick={() => handleSuggestedAmount(suggestedAmount)}
                  >
                    ${suggestedAmount}
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
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 border-0 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                icon={<SafetyOutlined />}
              >
                {loading ? 'Processing...' : 'Deposit Funds'}
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Security & Info Section */}
        <div className="space-y-6">
          {/* Security Features */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <CheckCircleOutlined className="text-xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Secure & Protected</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <CheckCircleOutlined className="text-green-500 mr-2" />
                <span>256-bit SSL encryption</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircleOutlined className="text-green-500 mr-2" />
                <span>Instant processing</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircleOutlined className="text-green-500 mr-2" />
                <span>PCI DSS compliant</span>
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircleOutlined className="text-green-500 mr-2" />
                <span>24/7 fraud monitoring</span>
              </div>
            </div>
          </div>

          {/* Deposit Limits */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <InfoCircleOutlined className="text-xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Deposit Limits</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Minimum deposit:</span>
                <span className="font-semibold text-gray-800">$1.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Maximum deposit:</span>
                <span className="font-semibold text-gray-800">$10,000.00</span>
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
              Our support team is available 24/7 to assist you with any questions about deposits or your wallet.
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

export default DepositForm;
