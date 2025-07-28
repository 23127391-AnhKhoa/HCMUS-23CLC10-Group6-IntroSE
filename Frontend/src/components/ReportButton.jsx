// src/components/ReportButton.jsx
import React from 'react';
import { Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ReportButton = ({ 
  userId, 
  size = 'small', 
  type = 'default',
  className = '',
  children 
}) => {
  const navigate = useNavigate();

  const handleReport = () => {
    if (userId) {
      // Nếu có userId, chuyển đến trang report với pre-filled data
      navigate('/report-user', { state: { targetUserId: userId } });
    } else {
      // Nếu không có userId, chỉ chuyển đến trang report
      navigate('/report-user');
    }
  };

  return (
    <Button
      type={type}
      size={size}
      icon={<ExclamationCircleOutlined />}
      onClick={handleReport}
      className={`border-red-300 text-red-600 hover:border-red-400 hover:text-red-600 ${className}`}
    >
      {children || 'Report User'}
    </Button>
  );
};

export default ReportButton;
