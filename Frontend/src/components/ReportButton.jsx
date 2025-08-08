// src/components/ReportButton.jsx
import React from 'react';
import { Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ReportButton = ({ 
  Id, 
  size = 'small', 
  type = 'default',
  className = '',
  children 
}) => {
  const { authUser } = useAuth();

  const navigate = useNavigate();

  const handleReport = () => {
    if (Id === authUser?.uuid) {
      // Nếu userId trùng với authUser, không cho phép report
      alert("You cannot report yourself.");
      return;
    } else if (type === 'report-gig' && Id == authUser?.uuid) {
      alert(
        "You cannot report your own gig."
      );
      return;
    }

    if (type === 'report-user') {
      // Nếu có userId, chuyển đến trang report với pre-filled data
      navigate('/report-user', { state: { targetUserId: Id } });
    } else if (type === 'report-gig') {
      // Nếu không có userId, chỉ chuyển đến trang report
      navigate('/report-gig', { state: { targetGigId: Id } });
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
