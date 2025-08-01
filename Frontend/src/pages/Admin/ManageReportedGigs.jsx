import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiHome, FiAlertCircle, FiTrendingUp, FiUsers, FiHelpCircle, FiSettings, FiEye, FiEdit2, FiTrash2, FiLock } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext'; // QUAN TRỌNG: Hãy chắc chắn đường dẫn này đúng

// --- Component Sidebar ---
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

// --- Component Bảng ---
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
                    {data && data.length > 0
                        ? data.map((item, index) => renderRow(item, index))
                        : <tr><td colSpan={headers.length} className="text-center p-6 text-gray-500">No data available.</td></tr>
                    }
                </tbody>
            </table>
        </div>
    </div>
);

// --- Component Modal để Ban ---
const BanModal = ({ target, targetType, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('1_minute');

    const isEditMode = target?.status === 'denied' || target?.status === 'inactive';
    const targetTitle = target?.title || target?.username || 'N/A';

    useEffect(() => {
        if (isEditMode && target) {
            setReason(target.ban_reason || '');
        }
    }, [isEditMode, target]);

    if (!target) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            return alert('Please provide a reason for banning.');
        }
        onConfirm(target.id || target.uuid, reason, duration);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? `Edit Ban (${targetType})` : `Ban ${targetType}`}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                    <input type="text" value={targetTitle} disabled className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                </div>

                <div className="mb-4">
                    <label htmlFor="banReason" className="block text-sm font-medium text-gray-700 mb-1">Ban Reason</label>
                    <textarea id="banReason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md h-20" />
                </div>

                <div className="mb-6">
                    <label htmlFor="banDuration" className="block text-sm font-medium text-gray-700 mb-1">Ban Duration</label>
                    <select id="banDuration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="1_minute">1 Minute (Test)</option>
                        <option value="1_day">1 Day</option>
                        <option value="1_week">1 Week</option>
                        <option value="1_month">1 Month</option>
                        <option value="forever">Forever</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleConfirm} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">{isEditMode ? 'Update Ban' : 'Confirm Ban'}</button>
                </div>
            </div>
        </div>
    );
};

// --- Hàm tiện ích ---
const parseReason = (description) => {
    if (!description || typeof description !== 'string') return 'N/A';
    return description.split('Additional details:')[0].replace('Report reason:', '').trim();
};

// --- Component Chính ---
const ReportsManagement = () => {
    const { token } = useAuth();
    const [reports, setReports] = useState({ mostReported: [], allReports: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('gigs');
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [targetToBan, setTargetToBan] = useState(null);

    const fetchReports = useCallback(async (searchQuery = '', tab = 'gigs') => {
        setIsLoading(true);
        setError(null);
        try {
            const endpoint = tab === 'gigs' ? '/api/admin/reports/gigs' : '/api/admin/reports/users';
            const response = await fetch(`${endpoint}?search=${searchQuery}`);
            if (!response.ok) throw new Error(`Failed to fetch ${tab} reports.`);
            const result = await response.json();
            if (result.status === 'success') {
                setReports(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            setError(err.message);
            setReports({ mostReported: [], allReports: [] });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            fetchReports(searchTerm, activeTab);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm, activeTab, fetchReports]);

    const openBanModal = (target) => {
        setTargetToBan(target);
        setIsBanModalOpen(true);
    };

    const handleConfirmBan = async (targetId, reason, duration) => {
        const targetType = activeTab === 'gigs' ? 'gig' : 'user';
        if (!window.confirm(`Are you sure you want to ban this ${targetType}?`)) return;
        if (!token) return alert('Access token is required');

        const endpoint = targetType === 'gig' ? `/api/gigs/${targetId}` : `/api/users/${targetId}`;
        
        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ban_reason: reason, ban_duration: duration }),
            });
            if (!response.ok) throw new Error(`Failed to ban ${targetType}.`);

            setIsBanModalOpen(false);
            setTargetToBan(null);
            fetchReports(searchTerm, activeTab);
            alert(`${targetType.charAt(0).toUpperCase() + targetType.slice(1)} has been banned.`);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDismissReport = async (logId) => {
        if (!window.confirm("Are you sure you want to dismiss this report?")) return;
        if (!token) return alert('Access token is required');

        try {
            const response = await fetch(`/api/admin/reports/logs/${logId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to dismiss report.");

            setReports(prev => ({
                ...prev,
                allReports: prev.allReports.filter(report => report.id !== logId)
            }));
        } catch (err) {
            alert(err.message);
        }
    };

    const renderAllReportsRow = (item) => {
        const target = activeTab === 'gigs' ? item.gig : item.user;
        const targetTitle = target?.title || target?.username || 'Deleted/Invalid Target';
        const isBanned = target?.status === 'denied' || target?.status === 'inactive';

        return (
            <tr key={item.id} className="border-b last:border-b-0">
                <td className="p-4 font-medium">{targetTitle}</td>
                <td className="p-4 text-gray-600">{item.reporter?.username || 'N/A'}</td>
                <td className="p-4 text-gray-600">{parseReason(item.description)}</td>
                <td className="p-4">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => window.open(activeTab === 'gigs' ? `/gig/${target?.id}` : `/profile/${target?.uuid}`, '_blank')}
                            disabled={!target}
                            className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50"
                            title="View Details"
                        ><FiEye size={18}/></button>
                        
                        <button 
                            onClick={() => openBanModal(target)}
                            disabled={!target}
                            className={`p-2 rounded-md ${isBanned ? 'bg-yellow-200 text-yellow-700 hover:bg-yellow-300' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'} disabled:opacity-50`}
                            title={isBanned ? "Edit Ban Settings" : "Ban this item"}
                        >
                            {isBanned ? <FiLock size={18} /> : <FiEdit2 size={18} />}
                        </button>
                        
                        <button
                            onClick={() => handleDismissReport(item.id)}
                            className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                            title="Dismiss Report"
                        ><FiTrash2 size={18} /></button>
                    </div>
                </td>
            </tr>
        );
    };
    
    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar />
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Manage Reports</h1>
                        <p className="text-gray-500 mt-1">Review and manage all reported gigs and users</p>
                    </div>
                    <div className="relative w-80">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={`Search reported ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white rounded-lg py-3 pl-12 pr-4 border"/>
                    </div>
                </div>

                <div className="flex border-b mb-6">
                    <button onClick={() => setActiveTab('gigs')} className={`px-4 py-2 font-semibold ${activeTab === 'gigs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Report Gigs</button>
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-semibold ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Report Users</button>
                </div>

                {isLoading ? ( <div className="text-center p-8">Loading...</div> ) 
                : error ? ( <div className="text-center p-8 text-red-500">Error: {error}</div> ) 
                : (
                    <>
                        <ReportsTable
                            title={activeTab === 'gigs' ? "Most Reported Gigs" : "Most Reported Users"}
                            headers={[activeTab === 'gigs' ? 'Gig' : 'User', 'Report Count', 'Actions']}
                            data={reports.mostReported}
                            renderRow={(item) => (
                                <tr key={item.gig_id || item.user_id} className="border-b last:border-b-0">
                                    <td className="p-4 font-medium">{item.gig_title || item.username}</td>
                                    <td className="p-4 text-gray-600 font-semibold">{item.report_count}</td>
                                    <td className="p-4">
                                      <button onClick={() => window.open(activeTab === 'gigs' ? `/gig/${item.gig_id}` : `/profile/${item.user_id}`, '_blank')} className="font-semibold text-blue-600 hover:underline">View</button>
                                    </td>
                                </tr>
                            )}
                        />
                        <ReportsTable
                            title={activeTab === 'gigs' ? "All Reported Gigs" : "All Reported Users"}
                            headers={[activeTab === 'gigs' ? 'Gig' : 'User', 'Reported By', 'Reason', 'Actions']}
                            data={reports.allReports}
                            renderRow={renderAllReportsRow}
                        />
                    </>
                )}
            </main>
            {isBanModalOpen && <BanModal target={targetToBan} targetType={activeTab.slice(0, -1)} onClose={() => setIsBanModalOpen(false)} onConfirm={handleConfirmBan} />}
        </div>
    );
};

export default ReportsManagement;