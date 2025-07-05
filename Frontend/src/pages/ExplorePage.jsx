import React, { useState, useEffect } from 'react';
import ServCard from '../Common/ServCard';
import Footer from '../Common/Footer';
import NavBar from '../Common/NavBar_Buyer';

const ExplorePage = () => {
    const [popularGigs, setPopularGigs] = useState([]);
    const [recommendedGigs, setRecommendedGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGigs();
    }, []);

    const fetchGigs = async () => {
        try {
            setLoading(true);
            console.log('🚀 Starting to fetch gigs...');
            
            // Fetch popular gigs (sorted by price desc, could be by rating in future)
            const popularUrl = 'http://localhost:8000/api/gigs?limit=10&sort_by=price&sort_order=desc';
            console.log('📡 Fetching popular gigs from:', popularUrl);
            const popularResponse = await fetch(popularUrl);
            console.log('📊 Popular response status:', popularResponse.status, popularResponse.statusText);
            console.log('📊 Popular response headers:', Object.fromEntries(popularResponse.headers.entries()));
            
            // Fetch recommended gigs (recent ones)
            const recommendedUrl = 'http://localhost:8000/api/gigs?limit=5&sort_by=created_at&sort_order=desc';
            console.log('📡 Fetching recommended gigs from:', recommendedUrl);
            const recommendedResponse = await fetch(recommendedUrl);
            console.log('📊 Recommended response status:', recommendedResponse.status, recommendedResponse.statusText);
            console.log('📊 Recommended response headers:', Object.fromEntries(recommendedResponse.headers.entries()));
            
            if (!popularResponse.ok || !recommendedResponse.ok) {
                // Get detailed error information
                let popularError = '';
                let recommendedError = '';
                
                try {
                    const popularErrorText = await popularResponse.text();
                    popularError = `Popular API Error (${popularResponse.status}): ${popularErrorText}`;
                    console.error('❌ Popular API Error:', popularError);
                } catch (e) {
                    popularError = `Popular API Error (${popularResponse.status}): Unable to read error response`;
                    console.error('❌ Popular API Error:', popularError);
                }
                
                try {
                    const recommendedErrorText = await recommendedResponse.text();
                    recommendedError = `Recommended API Error (${recommendedResponse.status}): ${recommendedErrorText}`;
                    console.error('❌ Recommended API Error:', recommendedError);
                } catch (e) {
                    recommendedError = `Recommended API Error (${recommendedResponse.status}): Unable to read error response`;
                    console.error('❌ Recommended API Error:', recommendedError);
                }
                
                throw new Error(`API Request Failed:\n${popularError}\n${recommendedError}`);
            }
            
            console.log('✅ Both responses OK, parsing JSON...');
            const popularData = await popularResponse.json();
            const recommendedData = await recommendedResponse.json();
            
            console.log('📦 Popular data received:', {
                status: popularData.status,
                dataLength: popularData.data?.length || 0,
                pagination: popularData.pagination,
                firstItem: popularData.data?.[0] || null
            });
            
            console.log('📦 Recommended data received:', {
                status: recommendedData.status,
                dataLength: recommendedData.data?.length || 0,
                pagination: recommendedData.pagination,
                firstItem: recommendedData.data?.[0] || null
            });
            
            setPopularGigs(popularData.data || []);
            setRecommendedGigs(recommendedData.data || []);
            
            console.log('✅ Gigs data successfully set in state');
        } catch (err) {
            console.error('💥 Fetch error details:', {
                message: err.message,
                stack: err.stack,
                name: err.name,
                cause: err.cause
            });
            
            // Check if it's a network error
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                console.error('🌐 Network Error: Cannot connect to the server. Check if:');
                console.error('   1. Backend server is running on http://localhost:8000');
                console.error('   2. CORS is properly configured');
                console.error('   3. No firewall/proxy blocking the request');
                setError('Network Error: Cannot connect to server. Is the backend running?');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
            console.log('🏁 Fetch operation completed');
        }
    };

    const renderGigCards = (gigs, fallbackCount = 10) => {
        if (loading) {
            // Show loading skeletons
            return Array.from({ length: fallbackCount }, (_, index) => (
                <div key={`skeleton-${index}`} className="flex flex-col h-[420px] w-[300px] m-1 bg-gray-200 animate-pulse rounded-xl">
                    <div className="h-[40%] bg-gray-300 rounded-t-xl"></div>
                    <div className="h-[45%] p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div className="space-y-1">
                                <div className="h-3 bg-gray-300 rounded w-20"></div>
                                <div className="h-2 bg-gray-300 rounded w-16"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded"></div>
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div className="h-[15%] bg-gray-100 rounded-b-xl"></div>
                </div>
            ));
        }

        if (error) {
            return (
                <div className="col-span-full flex flex-col justify-center items-center py-12 px-4">
                    <div className="text-lg text-red-600 mb-4 text-center">Error loading gigs:</div>
                    <div className="text-sm text-red-500 bg-red-50 p-4 rounded-lg max-w-2xl text-center whitespace-pre-line">
                        {error}
                    </div>
                    <button 
                        onClick={() => {
                            console.log('🔄 Manual retry triggered');
                            setError(null);
                            fetchGigs();
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                    <div className="mt-4 text-xs text-gray-500 text-center">
                        Check browser console (F12) for detailed debug information
                    </div>
                </div>
            );
        }

        if (gigs.length === 0) {
            // Show placeholder cards when no data
            return Array.from({ length: fallbackCount }, (_, index) => (
                <ServCard key={`placeholder-${index}`} />
            ));
        }

        return gigs.map((gig) => (
            <ServCard key={gig.id} gig={gig} />
        ));
    };

    return (
        <div id="explore-page" className = "min-h-screen bg-white flex flex-col items-center justify-center">
            <NavBar />
            
            {/* Debug Panel - Remove in production */}
            <div className="w-full max-w-6xl px-4 py-2 bg-gray-100 border-b border-gray-200">
                <div className="text-xs text-gray-600 flex flex-wrap gap-4">
                    <span>🔧 Debug Info:</span>
                    <span>Loading: {loading ? 'Yes' : 'No'}</span>
                    <span>Error: {error ? 'Yes' : 'No'}</span>
                    <span>Popular Gigs: {popularGigs.length}</span>
                    <span>Recommended Gigs: {recommendedGigs.length}</span>
                    <button 
                        onClick={() => {
                            console.log('🔄 Manual API test triggered');
                            fetchGigs();
                        }}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                        Test API
                    </button>
                    <button 
                        onClick={async () => {
                            console.log('🏥 Health check started');
                            try {
                                const response = await fetch('http://localhost:8000/api/gigs');
                                console.log('🏥 Health check result:', response.status, response.statusText);
                                alert(`Server status: ${response.status} ${response.statusText}`);
                            } catch (err) {
                                console.error('🏥 Health check failed:', err);
                                alert(`Server unreachable: ${err.message}`);
                            }
                        }}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                        Health Check
                    </button>
                </div>
            </div>
            
            <div id="most-popular" className='flex flex-col items-center rounded-lg shadow-lg p-6 mb-8 w-full max-w-fit'>
                <div className="text-2xl font-bold mb-8 w-full text-left p-2">
                    <span>Most popular Service in <span className='text-blue-500'>Freeland </span> </span>
                    {loading && <span className="text-sm font-normal text-gray-500 ml-2">Loading...</span>}
                </div>
                <div id="serv-container" className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-2 gap-y-8'>
                    {renderGigCards(popularGigs, 10)}
                </div>
            </div>
            <div id="may-like" className='flex flex-col items-center rounded-lg shadow-lg p-6 mb-8 w-full max-w-fit'>
                <div className="text-2xl font-bold mb-8 w-full text-left p-2">
                    <span>Services you might like</span>
                    {loading && <span className="text-sm font-normal text-gray-500 ml-2">Loading...</span>}
                </div>
                <div id="serv-container-like" className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-2 gap-y-8'>
                    {renderGigCards(recommendedGigs, 5)}
                </div>
            </div>
            
            {/* Add Footer */}
            <Footer />
        </div>
    );
}

export default ExplorePage;