// src/components/Wallet/TransactionHistory.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, message } from 'antd';
import { HistoryOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const TransactionHistory = ({ token, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch transaction history
  const fetchTransactionHistory = async (page = 1, type = 'all') => {
    try {
      setLoading(true);
      const response = await fetch(
        `${window.BASE_API || 'http://localhost:8000'}/api/transactions/history?page=${page}&limit=10&type=${type}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transaction history');
      }

      setTransactions(data.data.transactions || []);
      setPagination({
        current: data.data.pagination.currentPage,
        pageSize: data.data.pagination.itemsPerPage,
        total: data.data.pagination.totalItems
      });

    } catch (error) {
      console.error('Error fetching transaction history:', error);
      message.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  // Load transaction history on component mount and when refreshTrigger changes
  useEffect(() => {
    if (token) {
      fetchTransactionHistory();
    }
  }, [token, refreshTrigger]);

  // Table columns for transaction history
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag 
          icon={type === 'deposit' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
          color={type === 'deposit' ? 'green' : 'blue'}
        >
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <span className={record.type === 'deposit' ? 'text-green-600 font-semibold' : 'text-blue-600 font-semibold'}>
          {record.type === 'deposit' ? '+' : '-'}${parseFloat(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  // Handle table pagination change
  const handleTableChange = (paginationInfo) => {
    fetchTransactionHistory(paginationInfo.current);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Transaction History</h2>
        <p className="text-gray-600">View your recent deposits and withdrawals</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          onChange={handleTableChange}
          rowKey="id"
          locale={{
            emptyText: (
              <div className="py-8 text-center">
                <HistoryOutlined className="text-4xl text-gray-300 mb-2" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            )
          }}
        />
      </div>
    </div>
  );
};

export default TransactionHistory;
