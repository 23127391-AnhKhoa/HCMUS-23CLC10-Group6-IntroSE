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
            console.log('[ExplorePage] Starting to fetch gigs...');
            
            // Fetch popular gigs (sorted by price desc, could be by rating in future)
            const popularUrl = 'http://localhost:8000/api/gigs?limit=12&sort_by=price&sort_order=desc&filter_by_status=active';
            console.log('[ExplorePage] Fetching popular gigs from:', popularUrl);
            const popularResponse = await fetch(popularUrl);
            console.log('[ExplorePage] Popular response status:', popularResponse.status, popularResponse.statusText);
            console.log('[ExplorePage] Popular response headers:', Object.fromEntries(popularResponse.headers.entries()));
            
            // Fetch recommended gigs (recent ones)
            const recommendedUrl = 'http://localhost:8000/api/gigs?limit=12&sort_by=created_at&sort_order=desc&filter_by_status=active';
            console.log('[ExplorePage] Fetching recommended gigs from:', recommendedUrl);
            const recommendedResponse = await fetch(recommendedUrl);
            console.log('[ExplorePage] Recommended response status:', recommendedResponse.status, recommendedResponse.statusText);
            console.log('[ExplorePage] Recommended response headers:', Object.fromEntries(recommendedResponse.headers.entries()));
            
            if (!popularResponse.ok || !recommendedResponse.ok) {
                // Get detailed error information
                let popularError = '';
                let recommendedError = '';
                
                try {
                    const popularErrorText = await popularResponse.text();
                    popularError = `Popular API Error (${popularResponse.status}): ${popularErrorText}`;
                    console.error('[ExplorePage] Popular API Error:', popularError);
                } catch (e) {
                    popularError = `Popular API Error (${popularResponse.status}): Unable to read error response`;
                    console.error('[ExplorePage] Popular API Error:', popularError);
                }
                
                try {
                    const recommendedErrorText = await recommendedResponse.text();
                    recommendedError = `Recommended API Error (${recommendedResponse.status}): ${recommendedErrorText}`;
                    console.error('[ExplorePage] Recommended API Error:', recommendedError);
                } catch (e) {
                    recommendedError = `Recommended API Error (${recommendedResponse.status}): Unable to read error response`;
                    console.error('[ExplorePage] Recommended API Error:', recommendedError);
                }
                
                throw new Error(`API Request Failed:\n${popularError}\n${recommendedError}`);
            }
            
            console.log('[ExplorePage] Both responses OK, parsing JSON...');
            const popularData = await popularResponse.json();
            const recommendedData = await recommendedResponse.json();
            
            console.log('[ExplorePage] Popular data received:', {
                status: popularData.status,
                dataLength: popularData.data?.length || 0,
                pagination: popularData.pagination,
                firstItem: popularData.data?.[0] || null
            });
            
            console.log('[ExplorePage] Recommended data received:', {
                status: recommendedData.status,
                dataLength: recommendedData.data?.length || 0,
                pagination: recommendedData.pagination,
                firstItem: recommendedData.data?.[0] || null
            });
            
            setPopularGigs(popularData.data || []);
            setRecommendedGigs(recommendedData.data || []);
            
            console.log('[ExplorePage] Gigs data successfully set in state');
        } catch (err) {
            console.error('[ExplorePage] Fetch error details:', {
                message: err.message,
                stack: err.stack,
                name: err.name,
                cause: err.cause
            });
            
            // Check if it's a network error
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                console.error('[ExplorePage] Network Error: Cannot connect to the server. Check if:');
                console.error('[ExplorePage]   1. Backend server is running on http://localhost:8000');
                console.error('[ExplorePage]   2. CORS is properly configured');
                console.error('[ExplorePage]   3. No firewall/proxy blocking the request');
                setError('Network Error: Cannot connect to server. Is the backend running?');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
            console.log('[ExplorePage] Fetch operation completed');
        }
    };

    const renderGigCards = (gigs, fallbackCount = 10) => {
        if (loading) {
            // Show loading skeletons with enhanced design
            return Array.from({ length: fallbackCount }, (_, index) => (
                <div key={`skeleton-${index}`} className="flex flex-col h-[420px] w-full max-w-[300px] bg-white/70 backdrop-blur-sm animate-pulse rounded-2xl shadow-lg border border-white/30 overflow-hidden">
                    <div className="h-[40%] bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl"></div>
                    <div className="h-[45%] p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full"></div>
                            <div className="space-y-1">
                                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                        </div>
                    </div>
                    <div className="h-[15%] bg-gradient-to-br from-gray-100 to-gray-200 rounded-b-2xl"></div>
                </div>
            ));
        }

        if (error) {
            return (
                <div className="col-span-full flex flex-col justify-center items-center py-12 px-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-8 max-w-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="text-xl font-semibold text-red-600 mb-4">Error loading gigs</div>
                            <div className="text-sm text-red-500 bg-red-50 p-4 rounded-xl whitespace-pre-line">
                                {error}
                            </div>
                            <button 
                                onClick={() => {
                                    console.log('[ExplorePage] Manual retry triggered');
                                    setError(null);
                                    fetchGigs();
                                }}
                                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Try Again
                            </button>
                            <div className="mt-4 text-xs text-gray-500 text-center">
                                Check browser console (F12) for detailed debug information
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (gigs.length === 0) {
            // Show elegant no data message
            return (
                <div className="col-span-full flex flex-col justify-center items-center py-16 px-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
                        <p className="text-gray-500 mb-4">We couldn't find any services at the moment. Please try again later.</p>
                        <button 
                            onClick={() => {
                                console.log('[ExplorePage] Manual refresh triggered');
                                fetchGigs();
                            }}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            );
        }

        return gigs.map((gig) => (
            <ServCard key={gig.id} gig={gig} />
        ));
    };

    return (
        <div id="explore-page" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden pt-20">
            {/* Custom animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-40px) rotate(180deg); }
                }
                @keyframes drift {
                    0%, 100% { transform: translateX(0px) translateY(0px); }
                    25% { transform: translateX(50px) translateY(-30px); }
                    50% { transform: translateX(-30px) translateY(-50px); }
                    75% { transform: translateX(-50px) translateY(30px); }
                }
                @keyframes morph {
                    0%, 100% { border-radius: 50%; transform: scale(1) rotate(0deg); }
                    25% { border-radius: 20%; transform: scale(1.3) rotate(90deg); }
                    50% { border-radius: 30%; transform: scale(1.5) rotate(180deg); }
                    75% { border-radius: 40%; transform: scale(1.2) rotate(270deg); }
                }
                @keyframes wave {
                    0%, 100% { transform: translateX(0px) scaleY(1); }
                    50% { transform: translateX(60px) scaleY(1.5); }
                }
                @keyframes spiral {
                    0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
                }
                @keyframes zigzag {
                    0%, 100% { transform: translateX(0px) translateY(0px); }
                    25% { transform: translateX(40px) translateY(-20px); }
                    50% { transform: translateX(0px) translateY(-40px); }
                    75% { transform: translateX(-40px) translateY(-20px); }
                }
                .float { animation: float 12s ease-in-out infinite; }
                .drift { animation: drift 16s ease-in-out infinite; }
                .morph { animation: morph 10s ease-in-out infinite; }
                .wave { animation: wave 14s ease-in-out infinite; }
                .spiral { animation: spiral 20s linear infinite; }
                .zigzag { animation: zigzag 18s ease-in-out infinite; }
            `}</style>
            
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Large floating shapes */}
                <div className="absolute top-20 left-10 w-80 h-80 bg-blue-100/25 rounded-full blur-3xl animate-pulse drift" style={{animationDuration: '18s'}}></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-100/15 rounded-full blur-3xl animate-pulse delay-1000 float" style={{animationDuration: '22s'}}></div>
                <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-purple-100/20 rounded-full blur-3xl animate-pulse delay-2000 morph" style={{animationDuration: '15s'}}></div>
                
                {/* Moving geometric shapes */}
                <div className="absolute top-1/3 left-1/3 w-40 h-40 bg-pink-100/15 rounded-full blur-2xl animate-bounce delay-300 drift" style={{animationDuration: '16s'}}></div>
                <div className="absolute top-2/3 right-1/3 w-56 h-56 bg-cyan-100/12 rounded-full blur-3xl animate-ping delay-700 float" style={{animationDuration: '20s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-100/20 rounded-full blur-xl animate-pulse delay-1500 morph" style={{animationDuration: '14s'}}></div>
                
                {/* Rectangular and square shapes */}
                <div className="absolute top-16 right-1/4 w-24 h-24 bg-emerald-100/25 blur-lg delay-500 drift" style={{animationDuration: '24s'}}></div>
                <div className="absolute bottom-1/3 left-16 w-44 h-44 bg-violet-100/15 transform rotate-12 blur-2xl delay-1200 float" style={{animationDuration: '18s'}}></div>
                <div className="absolute top-3/4 right-12 w-36 h-36 bg-rose-100/20 transform -rotate-12 blur-xl delay-800 morph" style={{animationDuration: '16s'}}></div>
                
                {/* Diamond and rotated shapes */}
                <div className="absolute top-1/5 left-2/3 w-28 h-28 bg-teal-100/30 transform rotate-45 blur-lg delay-1000 spiral" style={{animationDuration: '25s'}}></div>
                <div className="absolute bottom-1/5 right-1/4 w-20 h-20 bg-orange-100/35 transform rotate-45 blur-md delay-1700 zigzag" style={{animationDuration: '20s'}}></div>
                
                {/* Linear shapes and lines */}
                <div className="absolute top-1/4 left-1/2 w-2 h-32 bg-blue-200/40 blur-sm delay-2000 wave" style={{animationDuration: '18s'}}></div>
                <div className="absolute bottom-1/2 right-1/6 w-40 h-1 bg-purple-200/50 blur-sm delay-1800 drift" style={{animationDuration: '22s'}}></div>
                <div className="absolute top-2/3 left-1/6 w-1 h-24 bg-indigo-200/45 blur-sm delay-2500 float" style={{animationDuration: '16s'}}></div>
                
                {/* Oval and elliptical shapes */}
                <div className="absolute top-1/6 right-1/3 w-48 h-24 bg-cyan-100/20 rounded-full blur-xl delay-900 morph" style={{animationDuration: '19s'}}></div>
                <div className="absolute bottom-1/6 left-1/3 w-24 h-48 bg-pink-100/25 rounded-full blur-lg delay-1400 drift" style={{animationDuration: '17s'}}></div>
                
                {/* Triangular shapes (using CSS clip-path) */}
                <div className="absolute top-1/3 right-1/5 w-32 h-32 bg-amber-100/30 blur-lg delay-600 zigzag" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDuration: '21s'}}></div>
                <div className="absolute bottom-2/5 left-1/5 w-28 h-28 bg-lime-100/25 blur-md delay-1300 spiral" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDuration: '23s'}}></div>
                
                {/* More floating dots with varied sizes */}
                <div className="absolute top-1/4 left-3/4 w-20 h-20 bg-blue-200/35 rounded-full blur-sm delay-2000 drift" style={{animationDuration: '15s'}}></div>
                <div className="absolute bottom-1/4 right-2/3 w-16 h-16 bg-purple-200/40 rounded-full blur-sm delay-1800 float" style={{animationDuration: '19s'}}></div>
                <div className="absolute top-1/6 left-1/6 w-24 h-24 bg-indigo-200/25 rounded-full blur-lg delay-2500 morph" style={{animationDuration: '17s'}}></div>
                
                {/* Additional complex shapes */}
                <div className="absolute top-3/5 left-3/5 w-36 h-18 bg-emerald-100/20 rounded-full blur-lg delay-700 wave" style={{animationDuration: '20s'}}></div>
                <div className="absolute bottom-3/5 right-3/5 w-18 h-36 bg-violet-100/30 rounded-full blur-md delay-1100 zigzag" style={{animationDuration: '18s'}}></div>
                
                {/* Hexagonal shapes (using clip-path) */}
                <div className="absolute top-2/5 left-4/5 w-30 h-30 bg-rose-100/28 blur-lg delay-1600 spiral" style={{clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)', animationDuration: '24s'}}></div>
                <div className="absolute bottom-3/4 left-2/5 w-26 h-26 bg-sky-100/32 blur-md delay-2200 morph" style={{clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)', animationDuration: '16s'}}></div>
                
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3B82F6" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
                <NavBar />
                
                {/* Hero Section */}
                <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-center mt-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 lg:p-10 mb-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                            Discover Amazing Services
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                            Find the perfect freelance services for your business on Freeland
                        </p>
                    </div>
                </div>
                
                {/* Debug Panel - Remove in production */}
                <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-2 bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg mb-6">
                    <div className="text-xs text-gray-600 flex flex-wrap gap-2 sm:gap-4">
                        <span className="font-medium">Debug Info:</span>
                        <span className="px-2 py-1 bg-blue-100 rounded-full">Loading: {loading ? 'Yes' : 'No'}</span>
                        <span className="px-2 py-1 bg-red-100 rounded-full">Error: {error ? 'Yes' : 'No'}</span>
                        <span className="px-2 py-1 bg-green-100 rounded-full">Popular Gigs: {popularGigs.length}</span>
                        <span className="px-2 py-1 bg-purple-100 rounded-full">Recommended Gigs: {recommendedGigs.length}</span>
                        <button 
                            onClick={() => {
                                console.log('[ExplorePage] Manual API test triggered');
                                fetchGigs();
                            }}
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Test API
                        </button>
                        <button 
                            onClick={async () => {
                                console.log('[ExplorePage] Health check started');
                                try {
                                    const response = await fetch('http://localhost:8000/api/gigs');
                                    console.log('[ExplorePage] Health check result:', response.status, response.statusText);
                                    alert(`Server status: ${response.status} ${response.statusText}`);
                                } catch (err) {
                                    console.error('[ExplorePage] Health check failed:', err);
                                    alert(`Server unreachable: ${err.message}`);
                                }
                            }}
                            className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Health Check
                        </button>
                    </div>
                </div>
                
                <div id="most-popular" className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 lg:p-10 mb-8 w-full max-w-[95vw] lg:max-w-[90vw] xl:max-w-6xl mx-4 sm:mx-6 lg:mx-8'>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 w-full text-left">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Most popular Service in <span className='text-blue-500'>Freeland</span>
                        </span>
                        {loading && (
                            <span className="text-sm font-normal text-gray-500 ml-2 animate-pulse">
                                Loading...
                            </span>
                        )}
                    </div>
                    <div id="serv-container" className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 justify-items-center'>
                        {renderGigCards(popularGigs, 12)}
                    </div>
                </div>
                
                <div id="may-like" className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 lg:p-10 mb-8 w-full max-w-[95vw] lg:max-w-[90vw] xl:max-w-6xl mx-4 sm:mx-6 lg:mx-8'>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 w-full text-left">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Services you might like
                        </span>
                        {loading && (
                            <span className="text-sm font-normal text-gray-500 ml-2 animate-pulse">
                                Loading...
                            </span>
                        )}
                    </div>
                    <div id="serv-container-like" className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 justify-items-center'>
                        {renderGigCards(recommendedGigs, 12)}
                    </div>
                </div>
                
                {/* Add Footer */}
                <Footer />
            </div>
        </div>
    );
}

export default ExplorePage;