import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServCard from '../Common/ServCard';
import Footer from '../Common/Footer';
import NavBar from '../Common/NavBar_Buyer';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [categories, setCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [categoryFromNavbar, setCategoryFromNavbar] = useState(false); // Track if category came from navbar

    useEffect(() => {
        const queryFromUrl = searchParams.get('q');
        const categoryFromUrl = searchParams.get('category');
        
        if (queryFromUrl) {
            setSearchQuery(queryFromUrl);
        }
        
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
            // If category comes from URL and no search query, it's from navbar
            setCategoryFromNavbar(!queryFromUrl);
        }
        
        // Perform search if either query or category is provided
        if (queryFromUrl || categoryFromUrl) {
            searchGigs(queryFromUrl);
        }
        
        fetchCategories();
    }, [searchParams]);

    // Fetch categories for filter dropdown
    const fetchCategories = async () => {
        try {
            console.log('[SearchPage] Fetching categories...');
            const response = await fetch('http://localhost:8000/api/categories');
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setCategories(data.data || []);
                    console.log('[SearchPage] Categories loaded:', data.data?.length || 0);
                } else {
                    console.warn('[SearchPage] Categories API returned non-success status:', data.status);
                }
            } else {
                console.warn('[SearchPage] Categories API response not ok:', response.status);
            }
        } catch (err) {
            console.error('[SearchPage] Error fetching categories:', err);
            // Don't set error state as categories are optional
        }
    };

    // Search gigs
    const searchGigs = async (query = searchQuery) => {
        try {
            setLoading(true);
            setError(null);
            console.log('[SearchPage] Starting search with:', {
                search: query,
                category: selectedCategory,
                priceRange,
                sortBy,
                sortOrder
            });

            const params = new URLSearchParams({
                limit: '24',
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_by_status: 'active'
            });

            if (query?.trim()) {
                params.append('search', query.trim());
            }

            if (selectedCategory) {
                params.append('filter_by_category_id', selectedCategory);
            }

            // Note: Price filtering will be done on frontend since backend doesn't support min_price/max_price yet
            // if (priceRange.min && !isNaN(parseFloat(priceRange.min))) {
            //     params.append('min_price', priceRange.min);
            // }
            // 
            // if (priceRange.max && !isNaN(parseFloat(priceRange.max))) {
            //     params.append('max_price', priceRange.max);
            // }

            const searchUrl = `http://localhost:8000/api/gigs?${params}`;
            console.log('[SearchPage] Search URL:', searchUrl);

            const response = await fetch(searchUrl);
            if (!response.ok) {
                // Get the error message from the server
                let errorMessage = `Search failed: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If we can't parse JSON, use the status text
                    errorMessage = `Search failed: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            if (data.status === 'success') {
                let results = data.data || [];
                
                // Always apply price filtering on frontend 
                if (priceRange.min || priceRange.max) {
                    const minPrice = parseFloat(priceRange.min) || 0;
                    const maxPrice = parseFloat(priceRange.max) || Infinity;
                    results = results.filter(gig => {
                        const price = parseFloat(gig.price);
                        return price >= minPrice && price <= maxPrice;
                    });
                    console.log('[SearchPage] Applied frontend price filtering');
                }

                setSearchResults(results);
                setTotalResults(results.length);
                console.log('[SearchPage] Search results:', results.length);
            } else {
                throw new Error(data.message || 'Search failed');
            }
        } catch (err) {
            console.error('[SearchPage] Search error:', err);
            setError(`Search failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Clear filters
    const clearFilters = () => {
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
        setSortBy('created_at');
        setSortOrder('desc');
        setError(null);
        setCategoryFromNavbar(false); // Reset navbar tracking
        searchGigs();
    };

    // Handle filter changes
    useEffect(() => {
        if (searchQuery || selectedCategory) {
            searchGigs();
        }
    }, [selectedCategory, sortBy, sortOrder]);

    // Handle price range changes with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery || selectedCategory || priceRange.min || priceRange.max) {
                searchGigs();
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [priceRange]);

    const renderGigCards = () => {
        if (loading) {
            // Show loading skeletons
            return Array.from({ length: 12 }, (_, index) => (
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
                            <div className="text-xl font-semibold text-red-600 mb-4">Search Error</div>
                            <div className="text-sm text-red-500 bg-red-50 p-4 rounded-xl whitespace-pre-line">
                                {error}
                            </div>
                            <button 
                                onClick={() => {
                                    setError(null);
                                    searchGigs();
                                }}
                                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (searchResults.length === 0 && (searchQuery || selectedCategory)) {
            const selectedCategoryObj = categories.find(cat => cat.id.toString() === selectedCategory);
            const searchContext = searchQuery 
                ? `"${searchQuery}"${selectedCategoryObj ? ` in ${selectedCategoryObj.name}` : ''}` 
                : selectedCategoryObj 
                    ? `in ${selectedCategoryObj.name}`
                    : '';
                    
            return (
                <div className="col-span-full flex flex-col justify-center items-center py-16 px-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No gigs found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchContext 
                                ? `No services found for ${searchContext}. Try different keywords or clear filters.`
                                : 'No services found. Try different keywords or clear filters.'
                            }
                        </p>
                        <button 
                            onClick={clearFilters}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            );
        }

        return searchResults.map((gig) => (
            <ServCard key={gig.id} gig={gig} />
        ));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-80 h-80 bg-blue-100/25 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-100/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-purple-100/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
                <NavBar />
                
                {/* Search Header */}
                <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 mt-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {(() => {
                                        const selectedCategoryObj = categories.find(cat => cat.id.toString() === selectedCategory);
                                        if (selectedCategoryObj) {
                                            return `Gigs in ${selectedCategoryObj.name}`;
                                        } else if (searchQuery) {
                                            return "Search Results";
                                        } else {
                                            return "All Gigs";
                                        }
                                    })()}
                                </h1>
                                {searchQuery && (
                                    <p className="text-gray-600 mt-2">
                                        {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
                                        {selectedCategory && categories.find(cat => cat.id.toString() === selectedCategory) && 
                                            ` in ${categories.find(cat => cat.id.toString() === selectedCategory).name}`
                                        }
                                    </p>
                                )}
                                {!searchQuery && selectedCategory && categories.find(cat => cat.id.toString() === selectedCategory) && (
                                    <div className="mt-2">
                                        <p className="text-gray-600">
                                            {totalResults} gig{totalResults !== 1 ? 's' : ''} found
                                        </p>
                                        {categoryFromNavbar && categories.find(cat => cat.id.toString() === selectedCategory)?.description && (
                                            <p className="text-gray-500 text-sm mt-1 italic">
                                                {categories.find(cat => cat.id.toString() === selectedCategory).description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Filters Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                                </svg>
                                Filters
                            </button>
                        </div>
                        
                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => {
                                                setSelectedCategory(e.target.value);
                                                setCategoryFromNavbar(false); // Reset navbar tracking when using filter
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                                        <input
                                            type="number"
                                            placeholder="$0"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                                        <input
                                            type="number"
                                            placeholder="$1000"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    {/* Sort */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                        <select
                                            value={`${sortBy}_${sortOrder}`}
                                            onChange={(e) => {
                                                const [by, order] = e.target.value.split('_');
                                                setSortBy(by);
                                                setSortOrder(order);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="created_at_desc">Newest</option>
                                            <option value="created_at_asc">Oldest</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                    <button
                                        onClick={() => searchGigs()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Results Grid */}
                <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                            {renderGigCards()}
                        </div>
                    </div>
                </div>
                
                <Footer />
            </div>
        </div>
    );
};

export default SearchPage;
