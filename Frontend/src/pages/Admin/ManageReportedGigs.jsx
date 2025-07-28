import React, { useState, useEffect, useCallback } from 'react';
// Thêm các icon cho Sidebar
import { FiSearch, FiHome, FiList, FiTrendingUp, FiUsers, FiHelpCircle, FiSettings } from 'react-icons/fi';

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
          <a href="/admin/manage-reported-gigs" className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-smooth">
            <FiList className="mr-3" /> Report
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

const ReportsTable = ({ title, headers, data, renderRow }) => (
    <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-700 mb-4">{title}</h2>
        <div className="bg-white rounded-lg shadow-md">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        {headers.map(h => (
                            <th key={h} className="p-4 text-sm font-semibold text-gray-500">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((item, index) => renderRow(item, index))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="text-center p-6 text-gray-500">No data available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- Component Chính ---
const ManageReportedGigs = () => {
    const [reports, setReports] = useState({ mostReported: [], allReports: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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
                                    <td className="p-4 text-gray-600">Reported by: Multiple Users</td>
                                    <td className="p-4 text-gray-600">Reason: Multiple</td>
                                    <td className="p-4 text-gray-600 font-semibold">{item.report_count}</td>
                                    <td className="p-4"><button className="font-semibold text-blue-600 hover:underline">View Details</button></td>
                                </tr>
                            )}
                        />

                        <ReportsTable
                            title="All Reported Gigs"
                            headers={['Gig', 'Reported By', 'Reason', 'Actions']}
                            data={reports.allReports}
                            renderRow={(item, index) => (
                                <tr key={item.id} className="border-b last:border-b-0">
                                    <td className="p-4 font-medium">{item.gig?.title || 'Gig not found'}</td>
                                    <td className="p-4 text-gray-600">Reported by: {item.reporter?.username || 'N/A'}</td>
                                    <td className="p-4 text-gray-600">{item.description}</td>
                                    <td className="p-4"><button className="font-semibold text-blue-600 hover:underline">View Details</button></td>
                                </tr>
                            )}
                        />
                    </>
                )}
            </main>
        </div>
    );
};

export default ManageReportedGigs;