// src/pages/DepositPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, message, Spin } from 'antd';
import { DollarOutlined, CreditCardOutlined, StarOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../Common/NavBar_Buyer';

const DepositPage = () => {
  const { authUser, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Các gói nạp tiền
  const depositPackages = [
    {
      id: 1,
      amount: 5,
      title: 'Starter Package',
      description: 'Perfect for small projects',
      icon: <DollarOutlined className="text-2xl" />,
      color: 'border-blue-200 hover:border-blue-400',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 2,
      amount: 10,
      title: 'Popular Package',
      description: 'Most chosen by users',
      icon: <CreditCardOutlined className="text-2xl" />,
      color: 'border-green-200 hover:border-green-400',
      bgColor: 'bg-green-50 hover:bg-green-100',
      popular: true
    },
    {
      id: 3,
      amount: 20,
      title: 'Premium Package',
      description: 'Best value for money',
      icon: <StarOutlined className="text-2xl" />,
      color: 'border-purple-200 hover:border-purple-400',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    }
  ];

  const handleDeposit = async (packageData) => {
    try {
      setLoading(true);
      setSelectedPackage(packageData.id);
      
      if (!token) {
        message.error('You must be logged in to deposit');
        navigate('/auth');
        return;
      }

      const response = await fetch('http://localhost:8000/api/transactions/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: packageData.amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deposit');
      }

      // Cập nhật user info trong context và localStorage (không có token mới)
      const { user: updatedUser } = data;
      
      // Chỉ update user data, không update token vì deposit API không trả về token mới
      updateUser(updatedUser);

      message.success(`Successfully deposited $${packageData.amount}! Your new balance is $${updatedUser.balance}`);
      
    } catch (error) {
      console.error('Error depositing:', error);
      message.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Add Funds to Your Wallet
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Choose a package to add money to your account
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
            <DollarOutlined className="mr-2" />
            Current Balance: ${authUser?.balance?.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Deposit Packages */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {depositPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden transition-all duration-300 ${pkg.color} ${pkg.bgColor} cursor-pointer transform hover:scale-105 hover:shadow-lg`}
                bodyStyle={{ padding: '2rem' }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-orange-500 text-white px-3 py-1 text-xs font-bold transform rotate-12 shadow-md">
                      POPULAR
                    </div>
                  </div>
                )}

                <div className="text-center">
                  {/* Icon */}
                  <div className="text-gray-600 mb-4">
                    {pkg.icon}
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${pkg.amount}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {pkg.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {pkg.description}
                  </p>

                  {/* Benefits */}
                  <div className="mb-6 space-y-2">
                    <div className="text-sm text-gray-600">
                      ✓ Instant deposit
                    </div>
                    <div className="text-sm text-gray-600">
                      ✓ Secure payment
                    </div>
                    <div className="text-sm text-gray-600">
                      ✓ No hidden fees
                    </div>
                  </div>

                  {/* Deposit Button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading && selectedPackage === pkg.id}
                    disabled={loading}
                    onClick={() => handleDeposit(pkg)}
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 font-semibold"
                  >
                    {loading && selectedPackage === pkg.id ? (
                      <>
                        <Spin size="small" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Deposit $${pkg.amount}`
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🔒 Secure Payment
              </h3>
              <p className="text-blue-700">
                Your transactions are protected with industry-standard encryption. 
                All deposits are processed instantly and securely.
              </p>
            </div>
          </Card>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button 
            size="large" 
            onClick={() => navigate(-1)}
            className="px-8"
          >
            Back to Previous Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepositPage;
