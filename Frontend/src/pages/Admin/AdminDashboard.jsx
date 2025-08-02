import React, { useState, useEffect, useCallback } from 'react';
import { FiHome, FiList, FiTrendingUp, FiUsers, FiSettings, FiHelpCircle, FiBell, FiSearch, FiArrowUp, FiArrowDown, FiMoreVertical, FiShoppingCart, FiUser, FiBarChart, FiFileText, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

// Helper functions (đặt ở đầu file AdminDashboard.js)
const getMonthLabels = () => {
    const labels = [];
    const date = new Date();
    for (let i = 8; i >= 0; i--) {
        const d = new Date(date);
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear().toString().slice(-2);
        // Nếu tháng là Jan, Dec của năm trước sẽ được hiển thị
        if (i > 0 && d.getMonth() === 11) {
             labels.push(`${parseInt(year) -1 }/${month}`);
        } else if (d.getMonth() === 0 && labels.length > 0 && !labels[labels.length -1].includes(year) ) {
             labels.push(`${year}/${month}`);
        }
        else {
             labels.push(month);
        }
    }
    //Đoạn code trên hoạt động không đúng, đây là đoạn code đúng
    labels.length = 0;
    for (let i = 8; i >= 0; i--) {
        const d = new Date(date);
        d.setMonth(date.getMonth() - i);
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = d.getFullYear().toString().slice(-2);
        
        let label = month;
        if (i === 8 || d.getMonth() === 0) { // Add year for the first month shown or for January
             label = `${year}/${month}`;
        }
        labels.push(label);
    }
    return labels;
};


const getDayLabels = () => {
  const labels = [];
  const date = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(date);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    // Hiển thị tháng nếu là ngày đầu tiên trong chuỗi hoặc ngày 1 của tháng
    if (i === 6 || day === 1) {
      labels.push(`${month}/${day}`);
    } else {
      labels.push(day.toString());
    }
  }
  return labels;
};

// Dữ liệu giả cho biểu đồ (như yêu cầu)
const salesOverviewDataMock = getMonthLabels().map(month => ({
  name: month,
  sales: Math.floor(Math.random() * 250) + 250, // Giữ hình dạng ngẫu nhiên
}));
const visitorsDataMock = getDayLabels().map(day => ({
  name: day,
  dark: Math.floor(Math.random() * 50) + 120,
  light: Math.floor(Math.random() * 40) + 80,
}));


const Sidebar = () => (
    <div className="w-64 bg-white h-screen flex flex-col justify-between p-4 shadow-lg">
      <div>
        <div className="flex items-center justify-center mb-10 p-2">
          <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
        </div>
        <nav className="flex flex-col space-y-2">
          <a href="/admin/admindashboard" className="flex items-center p-3 bg-gray-100 text-gray-800 font-bold rounded-lg transition-smooth">
            <FiHome className="mr-3" /> Dashboard
          </a>
          <a href="/admin/manage-reported-gigs" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiAlertCircle className="mr-3" /> Report
          </a>
          <a href="/admin/servicemanagement" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiTrendingUp className="mr-3" /> Services Management
          </a>
          <a href="/admin/usermanagement" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiUsers className="mr-3" /> User Management
          </a>
        </nav>
      </div>
      <div className="flex flex-col space-y-2">
        <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
          <FiHelpCircle className="mr-3" /> Help
        </a>
        <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
          <FiSettings className="mr-3" /> Settings
        </a>
      </div>
    </div>
);

const DashboardHeader = ({ onRefresh }) => (
  <div className="flex justify-between items-center mb-6 px-4">
    {/* Left: Title */}
    <h1 className="text-3xl font-bold ">Admin Dashboard</h1>

    {/* Right: Icons + Avatar */}
    <div className="flex items-center space-x-4">
      <button 
        onClick={onRefresh}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Refresh</span>
      </button>
      <FiMessageSquare className="text-gray-600 text-xl hover:text-blue-500 transition duration-200" />
      <FiBell className="text-gray-600 text-xl hover:text-blue-500 transition duration-200" />
      <img
        src="https://i.pravatar.cc/40?img=3" // thay bằng avatar thật nếu có
        alt="avatar"
        className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-sm cursor-pointer"
      />
    </div>
  </div>
);

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-md flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-500 font-semibold">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="bg-blue-500 p-3 rounded-full text-white">{icon}</div>
    </div>
);
const ChartCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-bold text-lg text-gray-800 mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
    </div>
);

const TableCard = ({ title, headers, data, renderRow }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-bold text-lg text-gray-800 mb-4">{title}</h3>
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b">
                    {headers.map(h => <th key={h} className="text-left font-semibold text-gray-500 pb-3">{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => renderRow(item, index))}
            </tbody>
        </table>
    </div>
);


// --- Component Chính ---
const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            // Add timestamp to bypass caching
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/admin/analytics?t=${timestamp}`, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch analytics data');
            const result = await response.json();
            if (result.status === 'success') {
                console.log('📊 Analytics data:', result.data); // Debug log
                setAnalytics(result.data);
                setError(null); // Clear any previous errors
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            console.error('❌ Error fetching analytics:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchAnalytics();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        fetchAnalytics();
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading Dashboard...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

    const { todaySales, todayAccess, newUsers, monthlyFinancials, topBuyers, topSellers } = analytics || {};
    
    // Debug log to see the actual values
    console.log('🔍 Current analytics state:', { todaySales, todayAccess, newUsers });

    // Format data cho biểu đồ
    const chartData = monthlyFinancials.map(item => ({
        name: new Date(item.month + '-02').toLocaleString('default', { month: 'short' }),
        Revenue: item.revenue,
        Profit: item.profit
    }));

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6">
                <DashboardHeader onRefresh={handleRefresh} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard title="Today's Revenue" value={`$${todaySales?.toLocaleString() || '0'}`} icon={<FiShoppingCart />} />
                    <StatCard 
                        title="Today's Visitors" 
                        value={todayAccess?.toLocaleString() || '0'} 
                        icon={<FiBarChart />} 
                    />
                    <StatCard title="Total Orders" value={analytics?.totalOrders?.toLocaleString() || "0"} icon={<FiBarChart />} />
                    <StatCard title="Active Gigs" value={analytics?.activeGigs?.toLocaleString() || "0"} icon={<FiFileText />} />
                </div>

                <div className="mb-6">
                    <ChartCard title="Monthly Revenue & Profit Overview">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="Revenue" fill="#3B82F6" />
                            <Bar dataKey="Profit" fill="#10B981" />
                        </BarChart>
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TableCard
                        title="Top Buyers This Month"
                        headers={['Customer', 'Total Spent']}
                        data={topBuyers}
                        renderRow={(item, index) => (
                            <tr key={index}>
                                <td className="py-3 flex items-center">
                                    <img src={item.avt_url || `https://i.pravatar.cc/150?u=${item.username}`} alt={item.username} className="w-8 h-8 rounded-full mr-3"/>
                                    {item.username}
                                </td>
                                <td className="font-semibold">${parseFloat(item.total_spent).toLocaleString()}</td>
                            </tr>
                        )}
                    />
                    <TableCard
                        title="Top Sellers This Month"
                        headers={['Seller', 'Total Earned']}
                        data={topSellers}
                        renderRow={(item, index) => (
                            <tr key={index}>
                                <td className="py-3 flex items-center">
                                    <img src={item.avt_url || `https://i.pravatar.cc/150?u=${item.username}`} alt={item.username} className="w-8 h-8 rounded-full mr-3"/>
                                    {item.username}
                                </td>
                                <td className="font-semibold">${parseFloat(item.total_earned).toLocaleString()}</td>
                            </tr>
                        )}
                    />
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;