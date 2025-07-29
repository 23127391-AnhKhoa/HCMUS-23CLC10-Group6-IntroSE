import React, { useState, useEffect, useCallback } from 'react';
// Thêm FiTrash2 và các icon khác
import { FiSearch, FiHome, FiAlertCircle, FiTrendingUp, FiUsers, FiHelpCircle, FiSettings, FiEye, FiEdit2, FiTrash2, FiLock } from 'react-icons/fi';
// Import useAuth để lấy token
import { useAuth } from '../../contexts/AuthContext'; // <-- QUAN TRỌNG: Hãy chắc chắn đường dẫn này đúng
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

          <a href="/admin/manage-reported-gigs" className="flex items-center p-3 bg-gray-100 text-gray-800 font-bold rounded-lg transition-smooth">

            <FiAlertCircle className="mr-3" /> Report

          </a>

          <a href="/admin/servicesmanagement" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">

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
const ReportsTable = ({ title, headers, data, renderRow }) => (
    <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-700 mb-4">{title}</h2>
        <div className="bg-white rounded-lg shadow-md">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        {headers.map(h => <th key={h} className="p-4 text-sm font-semibold text-gray-500">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((item, index) => renderRow(item, index))
                    ) : (
                        <tr><td colSpan={headers.length} className="text-center p-6 text-gray-500">No data available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);


// Hàm xử lý chuỗi Reason
const parseReason = (description) => {
    if (!description || typeof description !== 'string') return 'N/A';
    try {
        const mainPart = description.split('Additional details:')[0];
        const reason = mainPart.replace('Report reason:', '').trim();
        return reason || description;
    } catch {
        return description;
    }
};

const BanGigModal = ({ gig, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('1_minute');

    // ✅ THÊM: Kiểm tra nếu gig đã bị ban
    const isEditMode = gig?.status === 'denied';

    // ✅ THÊM: Load thông tin ban hiện tại khi edit
    useEffect(() => {
        if (isEditMode && gig) {
            setReason(gig.ban_reason || '');
            setDuration(gig.ban_duration || '1_minute');
        }
    }, [isEditMode, gig]);

    if (!gig) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert('Please provide a reason for banning.');
            return;
        }
        onConfirm(gig.id, reason, duration);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Ban Settings' : 'Ban Gig'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* ✅ THÊM: Hiển thị status hiện tại nếu đang edit */}
                {isEditMode && (
                    <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-200">
                        <p className="text-sm text-red-600 font-medium">
                            This gig is currently banned
                        </p>
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="gigTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Gig Title
                    </label>
                    <input
                        id="gigTitle"
                        type="text"
                        value={gig.title || 'N/A'}
                        disabled
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="banReason" className="block text-sm font-medium text-gray-700 mb-1">
                        Ban Reason
                    </label>
                    <textarea
                        id="banReason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter the reason for banning this gig..."
                        className="w-full p-2 border border-gray-300 rounded-md h-20 resize-none"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="banDuration" className="block text-sm font-medium text-gray-700 mb-1">
                        Ban Duration
                    </label>
                    <select
                        id="banDuration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="1_minute">1 Minute (Test)</option>
                        <option value="5_minutes">5 Minutes (Test)</option>
                        <option value="30_minutes">30 Minutes (Test)</option>
                        <option value="1_day">1 Day</option>
                        <option value="2_days">2 Days</option>
                        <option value="1_week">1 Week</option>
                        <option value="1_month">1 Month</option>
                        <option value="1_year">1 Year</option>
                        <option value="forever">Forever</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                        {isEditMode ? 'Update Ban' : 'Confirm Ban'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Component Chính ---
const ManageReportedGigs = () => {
    const { token } = useAuth(); // Lấy token từ Context
    const [reports, setReports] = useState({ mostReported: [], allReports: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [gigToBan, setGigToBan] = useState(null);


    const fetchReports = useCallback(async (searchQuery = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/reports/gigs?search=${searchQuery}`);
            if (!response.ok) throw new Error('Failed to fetch reports.');
            const result = await response.json();
            if (result.status === 'success') {
                setReports(result.data);
            } else {
                throw new Error(result.message || 'An unknown error occurred.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            fetchReports(searchTerm);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm, fetchReports]);
    

    const openBanModal = (gig) => {
        setGigToBan(gig);
        setIsBanModalOpen(true);
    };

    const handleConfirmBan = async (gigId, reason, duration) => {
    if (!window.confirm(`Are you sure you want to ban this gig?`)) return;
    if (!token) return alert('Access token is required');

    try {
        const response = await fetch(`/api/gigs/${gigId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ban_reason: reason,
                ban_duration: duration,
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Failed to ban the gig.");
        }

        // *** QUAN TRỌNG: Cập nhật UI ngay lập tức ***
        setReports(prev => ({
            ...prev,
            allReports: prev.allReports.map(report => 
                report.gig?.id === gigId 
                    ? { ...report, gig: { ...report.gig, status: 'denied' } }
                    : report
            ),
            mostReported: prev.mostReported.map(report => 
                report.gig_id === gigId 
                    ? { ...report, status: 'denied' }
                    : report
            )
        }));

        setIsBanModalOpen(false);
        setGigToBan(null);
        alert("Gig has been successfully banned.");

    } catch (err) {
        alert(err.message);
    }
};

    // --- HÀM MỚI: DISMISS REPORT ---
    const handleDismissReport = async (logId) => {
        if (!window.confirm("Are you sure you want to dismiss this report? It won't be shown again.")) return;
        if (!token) return alert('Access token is required');

        try {
            const response = await fetch(`/api/reports/logs/${logId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to dismiss report.");
            }
            
            // Xóa report khỏi UI ngay lập tức
            setReports(prev => ({
                ...prev,
                allReports: prev.allReports.filter(report => report.id !== logId)
            }));

        } catch (err) {
            alert(err.message);
        }
    };
    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar />
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Manage Reported Gigs</h1>
                        <p className="text-gray-500 mt-1">Review and manage all reported gigs</p>
                    </div>
                    <div className="relative w-80">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reported gigs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white rounded-lg py-3 pl-12 pr-4 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div>Loading reports...</div>
                ) : error ? (
                    <div className="text-red-500">Error: {error}</div>
                ) : (
                    <>
                        <ReportsTable
                            title="Most Reported Gigs"
                            headers={['Gig', 'Reported By', 'Reason', 'Report Count', 'Actions']}
                            data={reports.mostReported}
                            renderRow={(item, index) => (
                                <tr key={index} className="border-b last:border-b-0">
                                    <td className="p-4 font-medium">{item.gig_title}</td>
                                    <td className="p-4 text-gray-600">Multiple Users</td>
                                    <td className="p-4 text-gray-600">Multiple Reasons</td>
                                    <td className="p-4 text-gray-600 font-semibold">{item.report_count}</td>
                                    <td className="p-4">
                                        {/* Sửa đổi ở đây: Thêm nút View Details icon */}
                                        <button 
                                            onClick={() => window.open(`/admin/gig/${item.gig_id}`, '_blank')}
                                            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-smooth"
                                        >
                                            <FiEye className="mr-2"/> View
                                        </button>
                                    </td>
                                </tr>
                            )}
                        />

                        <ReportsTable
    title="All Reported Gigs"
    headers={['Gig', 'Reported By', 'Reason', 'Actions']}
    data={reports.allReports}
    renderRow={(item) => {
        const isGigBanned = item.gig?.status === 'denied';
        const hasValidGig = item.gig?.id;
        
        return (
            <tr key={item.id} className="border-b last:border-b-0">
                <td className="p-4 font-medium">{item.gig?.title || 'Deleted/Invalid Gig'}</td>
                <td className="p-4 text-gray-600">{item.reporter?.username || 'N/A'}</td>
                <td className="p-4 text-gray-600">{parseReason(item.description)}</td>
                <td className="p-4">
                    <div className="flex items-center space-x-2">
                        {/* View Button - Always enabled if gig exists */}
                        <button 
                            onClick={() => window.open(`/admin/gig/${item.gig?.id}`, '_blank')}
                            disabled={!hasValidGig}
                            className={`p-2 rounded-md transition-all ${
                                hasValidGig 
                                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title="View Details"
                        >
                            <FiEye size={18}/>
                        </button>
                        
                        {/* Ban Button - Show different states */}
{isGigBanned ? (
    // ✅ Gig đã bị ban - dùng icon Lock và màu vàng đậm hơn
    <button 
        onClick={() => openBanModal(item.gig)}
        className="p-2 rounded-md bg-yellow-200 text-yellow-700 hover:bg-yellow-300 cursor-pointer transition-all"
        title="Edit Ban Settings (Currently Banned)"
    >
        <FiLock size={18}/>
    </button>
) : (
    // ✅ Gig chưa bị ban - dùng icon Edit và màu vàng nhạt
    <button 
        onClick={() => openBanModal(item.gig)}
        disabled={!hasValidGig}
        className={`p-2 rounded-md transition-all ${
            hasValidGig 
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title="Ban this Gig"
    >
        <FiEdit2 size={18}/>
    </button>
)}
                        
                        {/* Dismiss Button - Always enabled */}
                        <button
                            onClick={() => handleDismissReport(item.id)}
                            className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer transition-all"
                            title="Dismiss Report"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    }}
/>
                    </>
                )}
            </main>
            {isBanModalOpen && ( <BanGigModal gig={gigToBan} onClose={() => setIsBanModalOpen(false)} onConfirm={handleConfirmBan} /> )}
        </div>
    );
};

export default ManageReportedGigs;