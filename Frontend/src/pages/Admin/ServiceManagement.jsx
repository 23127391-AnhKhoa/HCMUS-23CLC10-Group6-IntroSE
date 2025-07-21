import React, { useState, useEffect, useCallback } from 'react';
import { FiHome, FiList, FiTrendingUp, FiUsers, FiSettings, FiHelpCircle, FiSearch, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// Sửa đổi ở đây: Import useAuth để lấy token
import { useAuth } from "../../contexts/AuthContext";
// --- Components Con ---

const Sidebar = () => (
    <div className="w-64 bg-white h-screen flex flex-col justify-between p-4 shadow-lg">
      <div>
        <div className="flex items-center space-x-2 mb-10 p-2">
          <img src="https://i.pravatar.cc/150?u=freeland-logo" alt="Logo" className="w-10 h-10 rounded-full" />
          <span className="font-bold text-xl text-gray-800">FREELAND</span>
        </div>
        <nav className="flex flex-col space-y-2">
          <a href="/admin/admindashboard" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiHome className="mr-3" /> Dashboard
          </a>
          <a href="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiList className="mr-3" /> Orders
          </a>
          <a href="/admin/servicemanagement" className="flex items-center p-3 bg-gray-100 text-gray-800 font-bold rounded-lg transition-smooth">
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

const ServiceRow = ({ gig, onStatusChange }) => {
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'paused': return 'bg-yellow-100 text-yellow-700';
            case 'denied': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-200 text-gray-600';
        }
    };
    
    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-4 px-6 font-medium text-gray-800">{gig.title}</td>
            <td className="py-4 px-6 text-gray-600">{gig.category_name || 'N/A'}</td>
            <td className="py-4 px-6 text-gray-600">{gig.owner_username || 'N/A'}</td>
            <td className="py-4 px-6">
                <select 
                    value={gig.status} 
                    onChange={(e) => onStatusChange(gig.id, e.target.value)}
                    className={`px-3 py-1 text-sm font-semibold rounded-full border-none outline-none appearance-none ${getStatusClass(gig.status)}`}
                >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="denied">Denied</option>
                </select>
            </td>
            <td className="py-4 px-6">
                <button 
                    onClick={() => window.open(`/gig/${gig.id}`, '_blank')}
                    className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-smooth"
                >
                    <FiEye className="mr-2"/> View
                </button>
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
    // Sửa đổi ở đây: Lấy token từ AuthContext
    const { token } = useAuth();

    const [gigs, setGigs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState(null);

    const fetchGigs = useCallback(async (page = 1, searchQuery = '') => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/gigs?page=${page}&limit=8&search=${searchQuery}`);
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
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            fetchGigs(currentPage, searchTerm);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm, currentPage, fetchGigs]);

    const handleUpdateStatus = async (gigId, newStatus) => {
        // Sửa đổi ở đây: Kiểm tra có token không trước khi gọi API
        if (!token) {
            alert("Authentication token not found. Please log in.");
            return;
        }

        setGigs(prevGigs => prevGigs.map(gig => 
            gig.id === gigId ? { ...gig, status: newStatus } : gig
        ));

        try {
            const response = await fetch(`/api/gigs/${gigId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    // Sửa đổi ở đây: Gửi token trong Authorization header
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
            fetchGigs(currentPage, searchTerm);
        }
    };

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
                        <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-semibold">
                            Current Services
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
                                        <ServiceRow key={gig.id} gig={gig} onStatusChange={handleUpdateStatus} />
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