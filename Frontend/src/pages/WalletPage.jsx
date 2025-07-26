// src/pages/WalletPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from 'antd';
import { DollarOutlined, WalletOutlined, SecurityScanOutlined, CreditCardOutlined, ArrowUpOutlined, HistoryOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../Common/NavBar_Buyer';
import DepositForm from '../components/Wallet/DepositForm';
import WithdrawForm from '../components/Wallet/WithdrawForm';
import TransactionHistory from '../components/Wallet/TransactionHistory';

const WalletPage = () => {
  const { authUser, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger transaction history refresh
  const handleTransactionComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-0 right-0 m-4 text-red-500 hover:text-gray-700"
                aria-label="Close"
            >
                <CloseOutlined className="text-4xl" /> 
            </button>
          <div className="flex justify-center items-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full shadow-lg">
              <WalletOutlined className="text-3xl text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Your Wallet
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your funds with secure deposits, withdrawals, and transaction history
          </p>
        </div>

        {/* Current Balance Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarOutlined className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Current Balance</p>
                <p className="text-3xl font-bold text-gray-800">
                  ${authUser?.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 text-sm font-medium">
                <SecurityScanOutlined className="mr-1" />
                Secure Wallet
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs 
          defaultActiveKey="deposit" 
          size="large"
          className="bg-white rounded-2xl shadow-xl p-2"
          items={[
            {
              key: 'deposit',
              label: (
                <span className="flex items-center text-lg font-semibold">
                  <CreditCardOutlined className="mr-2" />
                  Deposit Funds
                </span>
              ),
              children: (
                <DepositForm 
                  token={token}
                  updateUser={updateUser}
                  onTransactionComplete={handleTransactionComplete}
                />
              )
            },
            {
              key: 'withdraw',
              label: (
                <span className="flex items-center text-lg font-semibold">
                  <ArrowUpOutlined className="mr-2" />
                  Withdraw Funds
                </span>
              ),
              children: (
                <WithdrawForm 
                  token={token}
                  authUser={authUser}
                  updateUser={updateUser}
                  onTransactionComplete={handleTransactionComplete}
                />
              )
            },
            {
              key: 'history',
              label: (
                <span className="flex items-center text-lg font-semibold">
                  <HistoryOutlined className="mr-2" />
                  Transaction History
                </span>
              ),
              children: (
                <TransactionHistory 
                  token={token}
                  refreshTrigger={refreshTrigger}
                />
              )
            }
          ]}
        />
      </div>
    </div>
  );
};

export default WalletPage;
