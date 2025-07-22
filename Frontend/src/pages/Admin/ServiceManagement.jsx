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
          <img src="https://i.pravatar.cc/150?u=freeland-logo" alt="Logo" className="w-10 h-10 rounded-full" />
          <span className="font-bold text-xl text-gray-800">FREELAND</span>
        </div>
        <nav className="flex flex-col space-y-2">
          <a href="/admin/dashboard" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
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
            <td className="py-4 px-6 text-gray-600">{gig.owner_username || 'N/A'}</td>
            <td className="py-4 px-6">
                {activeTab === 'current' ? (
                    <select 
                        value={gig.status} 
                        onChange={(e) => onStatusChange(gig.id, e.target.value)}
                        className={`px-3 py-1 text-sm font-semibold rounded-full border-none outline-none appearance-none ${getStatusClass(gig.status)}`}
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
                        onClick={() => window.open(`/gig/${gig.id}`, '_blank')}
                        className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-smooth"
                    >
                        <FiEye className="mr-2"/> View
                    </button>
                ) : (
                    <div className="flex items-center space-x-2">
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

// --- Component Chính ---
const ServicesManagement = () => {
    const { token } = useAuth();
    const [gigs, setGigs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('current');

    const fetchGigs = useCallback(async (page = 1, searchQuery = '', tab = 'current') => {
        setIsLoading(true);
        setError(null);
        
        // Lọc status dựa trên tab: pending cho tab pending, còn lại không lọc để lấy tất cả (active, paused, denied)
        const statusFilter = tab === 'pending' ? 'pending' : '';
        
        try {
            const response = await fetch(`/api/gigs?page=${page}&limit=8&search=${searchQuery}&filter_by_status=${statusFilter}`);
            if (!response.ok) throw new Error('Failed to fetch services.');
            
            const result = await response.json();
            if (result.status === 'success') {
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
        }
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            fetchGigs(currentPage, searchTerm, activeTab);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm, currentPage, activeTab, fetchGigs]);

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
                            onClick={() => { setActiveTab('current'); setCurrentPage(1); }}
                            className={`px-4 py-2 font-semibold ${activeTab === 'current' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                        >
                            Current Services
                        </button>
                        <button 
                            onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                            className={`px-4 py-2 font-semibold ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
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
                            className="w-full bg-white rounded-lg py-3 pl-12 pr-4 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-2">
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
                                    <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-red-500">{error}</td></tr>
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
                
                <Pagination 
                    currentPage={currentPage}
                    totalPages={paginationInfo?.pages || 1}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </main>
        </div>
    );
};

export default ServicesManagement;