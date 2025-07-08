// profile seller
// src/pages/Profile_Seller.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, Statistic, Progress } from 'antd';
import { UserOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import SellerNavbar from '../Common/NavBar_Seller';
import { useAuth } from '../contexts/AuthContext';

const ProfileSeller = () => {
    const { authUser } = useAuth();
    const navigate = useNavigate();

    // Dữ liệu giả cho Active Orders và Analytics
    const activeOrders = [
        { id: 1, gig: 'Logo Design for "Coffee House"', client: 'John Doe', price: 50, due: '2 days' },
        { id: 2, gig: 'Create a landing page', client: 'Jane Smith', price: 250, due: '5 days' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <SellerNavbar />
            <main className="container mx-auto px-4 py-8 pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* CỘT BÊN TRÁI (2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Phần Active Orders */}
                        <Card title={<span className="font-bold text-lg">Active Orders</span>}>
                            {activeOrders.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {activeOrders.map(order => (
                                        <li key={order.id} className="py-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-blue-600 cursor-pointer hover:underline">{order.gig}</p>
                                                <p className="text-sm text-gray-500">Client: {order.client}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg">${order.price}</p>
                                                <p className="text-sm text-red-500">Due in {order.due}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">You have no active orders.</p>
                            )}
                        </Card>

                        {/* Phần Analytics */}
                        <Card title={<span className="font-bold text-lg">Analytics</span>}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <Statistic
                                        title="Earnings in June"
                                        value={1128}
                                        precision={2}
                                        valueStyle={{ color: '#3f8600' }}
                                        prefix={<ArrowUpOutlined />}
                                        suffix="$"
                                    />
                                </Card>
                                <Card>
                                    <Statistic
                                        title="Orders Completed"
                                        value={9.3}
                                        precision={2}
                                        valueStyle={{ color: '#cf1322' }}
                                        prefix={<ArrowDownOutlined />}
                                        suffix="%"
                                    />
                                </Card>
                                <Card>
                                    <Statistic title="Avg. Selling Price" value={75} prefix="$" />
                                </Card>
                            </div>
                        </Card>
                    </div>

                    {/* CỘT BÊN PHẢI (1/3) */}
                    <div className="space-y-8">
                        {/* Khung thông tin cá nhân */}
                        <Card>
                            <div className="flex flex-col items-center text-center">
                                <Avatar 
                                    size={96} 
                                    src={authUser?.avatar_url}
                                    icon={!authUser?.avatar_url && <UserOutlined />}
                                />
                                <h2 className="text-2xl font-bold mt-4">{authUser?.fullname}</h2>
                                <p className="text-gray-500">@{authUser?.username}</p>
                                <p className="mt-2 text-sm">{authUser?.seller_headline}</p>
                                <div className="mt-4 w-full">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Response Rate</span>
                                        <span className="text-sm font-medium text-blue-700">95%</span>
                                    </div>
                                    <Progress percent={95} showInfo={false} strokeColor="#2563eb" />
                                </div>
                            </div>
                        </Card>
                        
                        {/* Nút Create Gig */}
                        <div>
                           <Button 
                                type="primary" 
                                size="large" 
                                block 
                                onClick={() => navigate('/create-gig')}
                            >
                                Create a New Gig
                            </Button>
                        </div>
                        <div>
                            <Button 
                                type="default" 
                                size="large" 
                                block 
                                onClick={() => navigate('/deposit')}
                            >
                                Deposit
                            </Button>
                        </div>
                        <div>
                            <Button 
                                type="default" 
                                size="large" 
                                block 
                                onClick={() => navigate('/withdraw')}
                            >
                                Withdraw
                            </Button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ProfileSeller;