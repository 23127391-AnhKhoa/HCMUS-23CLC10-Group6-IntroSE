// reportGigPage.jsx
// src/pages/ReportUserPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Select, Button, Card, message, Typography } from 'antd';
import { ExclamationCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../Common/NavBar_Buyer';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ReportGigPage = () => {
  const { authUser, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [prefilledUserId, setPrefilledUserId] = useState(null);

  // Pre-fill form if userId is passed via state
  useEffect(() => {
    if (location.state?.targetUserId) {
      const userId = location.state.targetUserId;
      setPrefilledUserId(userId);
      form.setFieldsValue({
        target_user_id: userId
      });
    }
  }, [location.state, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (!token) {
        message.error('You must be logged in to report a user');
        navigate('/auth');
        return;
      }

      const reportData = {
        target_id: values.target_user_id,
        target_type: 'gig',
        action_type: 'report gig',
        description: `Report reason: ${values.reason}. Additional details: ${values.description || 'No additional details provided.'}`
      };

      const response = await fetch(`${window.BASE_API || 'http://localhost:8000'}/api/admin/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      message.success('Report submitted successfully. Our team will review it shortly.');
      form.resetFields();
      
      // Redirect sau 2 giây
      setTimeout(() => {
        navigate(-1);
      }, 2000);

    } catch (error) {
      console.error('Error submitting report:', error);
      message.error(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reportReasons = [
    { value: 'Prohibited service', label: 'Prohibited service' },
    { value: 'Inappropriate content', label: 'Inappropriate content' },
    { value: 'Non-original elements (text, images, audio/video)', label: 'Non-original elements (text, images, audio/video)' },
    { value: 'Intellectual property violation (copyright, trademark)', label: 'Intellectual property violation (copyright, trademark)' },
    { value: 'Other', label: 'Other' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-3 rounded-full shadow-lg">
              <ExclamationCircleOutlined className="text-3xl text-white" />
            </div>
          </div>
          <Title level={1} className="text-gray-800 mb-2">
            Report a Gig
          </Title>
          <Text className="text-lg text-gray-600">
            {prefilledUserId
              ? "Please provide details about why you're reporting this gig"
              : "Help us maintain a safe and respectful community by reporting inappropriate behavior"
            }
          </Text>
        </div>

        {/* Report Form */}
        <Card className="shadow-xl border-0 rounded-2xl">
          <div className="p-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              {/* Target User ID - only show if not pre-filled */}
              {!prefilledUserId && (
                <Form.Item
                  label={<span className="text-gray-700 font-semibold">User ID to Report</span>}
                  name="target_user_id"
                  rules={[
                    { required: true, message: 'Please enter the User ID' },
                    { 
                      pattern: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
                      message: 'Please enter a valid UUID format'
                    }
                  ]}
                  extra="Enter the UUID of the user you want to report. You can find this in their profile URL."
                >
                  <Input
                    placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>
              )}

              {/* Hidden field for pre-filled user ID */}
              {prefilledUserId && (
                <Form.Item name="target_user_id" style={{ display: 'none' }}>
                  <Input />
                </Form.Item>
              )}

              {/* Report Reason */}
              <Form.Item
                label={<span className="text-gray-700 font-semibold">Report Reason</span>}
                name="reason"
                rules={[{ required: true, message: 'Please select a reason for reporting' }]}
              >
                <Select
                  placeholder="Select the reason for your report"
                  size="large"
                  className="rounded-lg"
                >
                  {reportReasons.map(reason => (
                    <Option key={reason.value} value={reason.value}>
                      {reason.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Additional Description */}
              <Form.Item
                label={<span className="text-gray-700 font-semibold">Additional Details</span>}
                name="description"
                rules={prefilledUserId ? [
                  { required: true, message: 'Please provide details about your report' }
                ] : []}
                extra={prefilledUserId 
                  ? "Please provide specific details about the incident that led to this report."
                  : "Please provide specific details about the incident, including when it occurred and any relevant context."
                }
              >
                <TextArea
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  maxLength={1000}
                  showCount
                  className="rounded-lg"
                />
              </Form.Item>

              {/* Warning Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <ExclamationCircleOutlined className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <Text strong className="text-yellow-800 block mb-1">
                      Important Notice
                    </Text>
                    <Text className="text-yellow-700 text-sm">
                      False reports may result in action against your account. Please ensure your report is accurate and made in good faith.
                      Our team will investigate all reports and take appropriate action.
                    </Text>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Form.Item>
                <div className="flex gap-4">
                  <Button
                    type="default"
                    size="large"
                    onClick={() => navigate(-1)}
                    icon={<ArrowLeftOutlined />}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 border-0 hover:from-red-600 hover:to-orange-700"
                    icon={<ExclamationCircleOutlined />}
                  >
                    {loading ? 'Submitting Report...' : 'Submit Report'}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <div className="text-center p-4">
            <Title level={4} className="text-blue-800 mb-2">
              Need Help?
            </Title>
            <Text className="text-blue-700">
              If you're experiencing immediate safety concerns, please contact our support team directly.
              For general questions about our community guidelines, visit our Help Center.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportGigPage;
