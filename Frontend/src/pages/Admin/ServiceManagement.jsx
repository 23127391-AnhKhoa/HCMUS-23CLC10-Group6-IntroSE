import React, { useState, useEffect, useCallback } from 'react';
// Thêm icon Check và X để duyệt gig
import { FiHome, FiList, FiTrendingUp, FiUsers, FiSettings, FiHelpCircle, FiSearch, FiEye, FiChevronLeft, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';
// Import useAuth để lấy token
import { useAuth } from '../../contexts/AuthContext'; // <-- QUAN TRỌNG: Hãy chắc chắn đường dẫn này đúng với cấu trúc dự án của bạn

// --- Components Con ---

const Sidebar = () => (
    <div className="w-64 bg-white h-screen flex flex-col justify-between p-4 shadow-lg">
      <div>
        <div className="flex items-center space-x-2 mb-10 p-2">
          <img src="/logo.svg" alt="Logo" className="w-10 h-10 rounded-full" />
          <span className="font-bold text-xl text-gray-800">FREELAND</span>
        </div>
        <nav className="flex flex-col space-y-2">
          <a href="/admin/admindashboard" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiHome className="mr-3" /> Dashboard
          </a>
          <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiList className="mr-3" /> Orders
          </a>
          <a href="/admin/servicesmanagement" className="flex items-center p-3 bg-gray-100 text-gray-800 font-bold rounded-lg transition-smooth">
            <FiTrendingUp className="mr-3" /> Services Management
          </a>
          <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiUsers className="mr-3" /> Earnings
          </a>
          <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiUsers className="mr-3" /> Community
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

const ServiceRow = ({ gig, onStatusChange, onApprove, onDeny, activeTab }) => {
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'paused': return 'bg-yellow-100 text-yellow-700';
            case 'denied': return 'bg-red-100 text-red-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-200 text-gray-600';
        }
    };
    
    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-4 px-6 font-medium text-gray-800">{gig.title}</td>
            <td className="py-4 px-6 text-gray-600">{gig.category_name || 'N/A'}</td>
            <td className="py-4 px-6">
                {gig.owner_username ? (
                    <button
                        onClick={() => window.open(`/admin/seller/${gig.owner_id || gig.user_id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors cursor-pointer"
                    >
                        {gig.owner_username}
                    </button>
                ) : (
                    <span className="text-gray-600">N/A</span>
                )}
            </td>
            <td className="py-4 px-6">
                {activeTab === 'current' ? (
                    <select 
                        value={gig.status} 
                        onChange={(e) => onStatusChange(gig.id, e.target.value)}
                        className={`px-6 py-1 text-sm font-semibold rounded-full border-none outline-none appearance-none ${getStatusClass(gig.status)}`}
                    >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="denied">Denied</option>
                    </select>
                ) : (
                    <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getStatusClass(gig.status)}`}>
                        {gig.status}
                    </span>
                )}
            </td>
            <td className="py-4 px-6">
                {activeTab === 'current' ? (
                    <button 
                        onClick={() => window.open(`/admin/gig/${gig.id}`, '_blank')}
                        className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-smooth"
                    >
                        <FiEye className="mr-2"/> View
                    </button>
                ) : (
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => window.open(`/admin/gig/${gig.id}`, '_blank')}
                            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-2 rounded-lg transition-smooth"
                            title="View Gig"
                        >
                            <FiEye className="mr-1"/> View
                        </button>
                        <button onClick={() => onApprove(gig.id)} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200" title="Approve">
                            <FiCheck size={18}/>
                        </button>
                        <button onClick={() => onDeny(gig.id)} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200" title="Deny">
                            <FiX size={18}/>
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center mt-6 space-x-2">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
                <FiChevronLeft />
            </button>
            {pages.map(page => (
                <button 
                    key={page} 
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
                >
                    {page}
                </button>
            ))}
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
                <FiChevronRight />
            </button>
        </div>
    );
};

// Loading Skeleton Component - Cải thiện với animation mượt hơn
const TableSkeleton = () => (
    <div>
        {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-gray-200 animate-pulse">
                <td className="py-4 px-6">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-3/4"></div>
                </td>
                <td className="py-4 px-6">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-1/2" style={{animationDelay: '0.1s'}}></div>
                </td>
                <td className="py-4 px-6">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-1/3" style={{animationDelay: '0.2s'}}></div>
                </td>
                <td className="py-4 px-6">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full w-20" style={{animationDelay: '0.3s'}}></div>
                </td>
                <td className="py-4 px-6">
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-16" style={{animationDelay: '0.4s'}}></div>
                </td>
            </tr>
        ))}
    </div>
);

// Component cho hiệu ứng loading trong bảng
const TableLoadingOverlay = ({ message = "Loading..." }) => (
    <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
        <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">{message}</p>
        </div>
    </div>
);

// --- Component Chính ---
const ServicesManagement = () => {
    const { token } = useAuth();
    const [gigs, setGigs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTabChanging, setIsTabChanging] = useState(false); // State cho tab transition
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('current');

    const fetchGigs = useCallback(async (page = 1, searchQuery = '', tab = 'current', isTabChange = false) => {
        // Chỉ set loading chung khi lần đầu load, còn chuyển tab thì dùng isTabChanging
        if (isTabChange) {
            setIsTabChanging(true);
        } else if (gigs.length === 0) {
            setIsLoading(true);
        }
        
        setError(null);
        
        // Lọc status dựa trên tab: pending cho tab pending, còn lại không lọc để lấy tất cả (active, paused, denied)
        const statusFilter = tab === 'pending' ? 'pending' : '';
        
        try {
            const response = await fetch(`/api/gigs?page=${page}&limit=8&search=${searchQuery}&filter_by_status=${statusFilter}`);
            if (!response.ok) throw new Error('Failed to fetch services.');
            
            const result = await response.json();
            if (result.status === 'success') {
                // Thêm delay nhẹ để hiệu ứng transition mượt hơn
                if (isTabChange) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                setGigs(result.data);
                setPaginationInfo(result.pagination);
            } else {
                throw new Error(result.message || 'Failed to fetch services.');
            }
        } catch (err) {
            setError(err.message);
            setGigs([]); // Reset gigs nếu có lỗi
        } finally {
            setIsLoading(false);
            setIsTabChanging(false);
        }
    }, [gigs.length]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            fetchGigs(currentPage, searchTerm, activeTab);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm, currentPage, fetchGigs, activeTab]);

    // Handle tab change với smooth transition
    const handleTabChange = (newTab) => {
        if (newTab !== activeTab) {
            setActiveTab(newTab);
            setCurrentPage(1);
            setSearchTerm(''); // Reset search khi chuyển tab
            fetchGigs(1, '', newTab, true); // Pass isTabChange = true
        }
    };

    const handleUpdateStatus = async (gigId, newStatus) => {
        if (!token) return alert("Authentication token not found. Please log in.");
        
        setGigs(prevGigs => prevGigs.map(gig => 
            gig.id === gigId ? { ...gig, status: newStatus } : gig
        ));

        try {
            const response = await fetch(`/api/gigs/${gigId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to update status.');
            }
        } catch (err) {
            alert(err.message);
            fetchGigs(currentPage, searchTerm, activeTab);
        }
    };

    const handleApprovalAction = async (gigId, newStatus) => {
        if (!token) return alert("Authentication required.");
        
        try {
            await handleUpdateStatus(gigId, newStatus);
            // Xóa gig vừa duyệt khỏi danh sách pending trên UI
            setGigs(prevGigs => prevGigs.filter(gig => gig.id !== gigId));
        } catch (err) {
            // Lỗi đã được xử lý trong handleUpdateStatus
        }
    };

    const handleApproveGig = (gigId) => handleApprovalAction(gigId, 'active');
    const handleDenyGig = (gigId) => handleApprovalAction(gigId, 'denied');

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar />
            <main className="flex-1 p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Services Management</h1>
                    <p className="text-gray-500 mt-1">Manage all services offered on the platform</p>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                    <div className="flex border-b">
                        <button 
                            onClick={() => handleTabChange('current')}
                            disabled={isTabChanging}
                            className={`px-4 py-2 font-semibold transition-all duration-200 ${
                                activeTab === 'current' 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            } ${isTabChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Current Services
                        </button>
                        <button 
                            onClick={() => handleTabChange('pending')}
                            disabled={isTabChanging}
                            className={`px-4 py-2 font-semibold transition-all duration-200 ${
                                activeTab === 'pending' 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            } ${isTabChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Pending Approvals
                        </button>
                    </div>
                    <div className="relative w-80">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            disabled={isTabChanging}
                            className={`w-full bg-white rounded-lg py-3 pl-12 pr-4 border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                isTabChanging ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        />
                    </div>
                </div>

                {/* Container với relative position để chứa loading overlay */}
                <div className="relative bg-white rounded-xl shadow-md p-2 min-h-[500px] transition-all duration-300">
                    {/* Loading overlay chỉ xuất hiện khi chuyển tab */}
                    {isTabChanging && (
                        <TableLoadingOverlay message="Switching tab..." />
                    )}
                    
                    {/* Content với hiệu ứng fade */}
                    <div className={`transition-opacity duration-300 ${isTabChanging ? 'opacity-30' : 'opacity-100'}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                               <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-500">Service Title</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-500">Category</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-500">Seller</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-500">Status</th>
                                        <th className="py-4 px-6 text-sm font-semibold text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <TableSkeleton />
                                    ) : error ? (
                                        <tr><td colSpan="5" className="text-center py-8 text-red-500">{error}</td></tr>
                                    ) : gigs.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-8 text-gray-500">No services found</td></tr>
                                    ) : (
                                        gigs.map(gig => (
                                            <ServiceRow 
                                                key={gig.id} 
                                                gig={gig} 
                                                onStatusChange={handleUpdateStatus}
                                                onApprove={handleApproveGig}
                                                onDeny={handleDenyGig}
                                                activeTab={activeTab}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* Pagination cũng có hiệu ứng fade */}
                <div className={`transition-opacity duration-300 ${isTabChanging ? 'opacity-30' : 'opacity-100'}`}>
                    {!isLoading && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={paginationInfo?.pages || 1}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </div>
            </main>
            
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};

export default ServicesManagement;