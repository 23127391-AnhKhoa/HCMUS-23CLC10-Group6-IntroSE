import React from 'react';
import { Button, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ReportButton = ({
  Id,
  type = 'report-user', // or 'report-gig'
  className = '',
}) => {
  const { authUser } = useAuth();
  const navigate = useNavigate();

  const handleReport = () => {
    if (Id === authUser?.uuid) {
      alert("You cannot report yourself.");
      return;
    } else if (type === 'report-gig' && Id === authUser?.uuid) {
      alert("You cannot report your own gig.");
      return;
    }

    if (type === 'report-user') {
      navigate('/report-user', { state: { targetUserId: Id } });
    } else if (type === 'report-gig') {
      navigate('/report-gig', { state: { targetGigId: Id } });
    }
  };

  return (
    <Tooltip title="Report">
      <Button
        type="text"
        shape="circle"
        icon={<ExclamationCircleOutlined />}
        onClick={handleReport}
        className={`text-red-500 hover:text-red-600 ${className}`}
      />
    </Tooltip>
  );
};

export default ReportButton;
