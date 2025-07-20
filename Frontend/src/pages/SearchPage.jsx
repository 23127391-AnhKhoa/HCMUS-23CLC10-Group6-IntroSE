import React, { useState, useEffect, useRef } from 'react';
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
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sort, setSort] = useState('relevance_desc'); // Combined sort state with relevance as default
    const [categories, setCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(true); // Show filters by default
    const [totalResults, setTotalResults] = useState(0);
    const [categoryFromNavbar, setCategoryFromNavbar] = useState(false); // Track if category came from navbar
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
    const [currentPage, setCurrentPage] = useState(1); // Track current page
    const [totalPages, setTotalPages] = useState(1); // Track total pages
    const [showScrollTop, setShowScrollTop] = useState(false); // Track scroll position for scroll-to-top button

    // Derived values from sort state
    const [sortBy, sortOrder] = sort.split('_');
    
    // Debug log to track sort state
    console.log('[SearchPage] Current sort state:', { sort, sortBy, sortOrder });

    // Handle scroll to show/hide scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.pageYOffset > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

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
        
        // Always perform search - pass both query and category to ensure proper filtering
        searchGigs(queryFromUrl || '', 1, categoryFromUrl);
        
        fetchCategories();
        setIsInitialLoad(false);
        
        // Auto scroll to top when entering search page
        scrollToTop();
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

    // Search gigs with pagination support
    const searchGigs = async (query = searchQuery, page = 1, categoryId = selectedCategory) => {
        try {
            setLoading(true);
            setError(null);
            console.log('[SearchPage] Starting search with:', {
                search: query,
                category: categoryId,
                priceRange,
                sort: sort,
                page: page
            });

            const params = new URLSearchParams({
                limit: '24', // Keep consistent page size
                page: page.toString(),
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_by_status: 'active'
            });

            console.log('[SearchPage] Sort parameters:', { sort_by: sortBy, sort_order: sortOrder, page });
            console.log('[SearchPage] Current dropdown value should be:', sort);

            // Only add search param if query is not empty - empty query shows all gigs with "most relevant" sorting
            if (query?.trim()) {
                params.append('search', query.trim());
            }

            // Use the categoryId parameter instead of the state to ensure proper filtering
            if (categoryId) {
                params.append('filter_by_category_id', categoryId);
            } else if (selectedSubcategory) {
                params.append('filter_by_category_id', selectedSubcategory);
            }

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
                
                // Handle pagination logic more conservatively
                const itemsPerPage = 24;
                setCurrentPage(page);
                
                if (results.length < itemsPerPage) {
                    // This is the last page (or no results)
                    setTotalPages(page);
                    setTotalResults((page - 1) * itemsPerPage + results.length);
                } else {
                    // We have full results, so there might be more
                    // But only show one extra page until we know for sure
                    setTotalPages(page + 1);
                    setTotalResults((page - 1) * itemsPerPage + results.length); // Actual results counted so far
                }
                
                // Auto scroll to top after search (but not on initial load)
                if (!isInitialLoad && page === 1) {
                    setTimeout(() => scrollToTop(), 100);
                }
                
                console.log('[SearchPage] Search results:', results.length, 'on page', page);
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
        setSelectedSubcategory('');
        setPriceRange({ min: '', max: '' });
        setSort('relevance_desc'); // Reset to default sort
        setError(null);
        setCategoryFromNavbar(false); // Reset navbar tracking
        setCurrentPage(1); // Reset pagination
        setTotalPages(1);
        searchGigs('', 1, ''); // Start fresh search from page 1 with no category
    };

    // Navigate to specific page
    const goToPage = (page) => {
        if (page >= 1 && page !== currentPage) {
            searchGigs(searchQuery, page, selectedCategory);
        }
    };

    // Handle filter changes
    useEffect(() => {
        // Skip the initial load to avoid double search
        if (isInitialLoad) return;
        
        // Reset pagination when filters change
        setCurrentPage(1);
        setTotalPages(1);
        
        // Always trigger search when sort parameters or categories change
        // This ensures sorting works even when viewing "All Gigs"
        console.log('[SearchPage] useEffect triggered for filters:', { selectedCategory, selectedSubcategory, sort });
        searchGigs(searchQuery, 1, selectedCategory); // Start from page 1 with new filters
    }, [selectedCategory, selectedSubcategory, sort, isInitialLoad]);

    // Handle category change - reset subcategory when parent category changes
    useEffect(() => {
        setSelectedSubcategory('');
    }, [selectedCategory]);

    // Handle price range changes with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            // Reset pagination when price filter changes
            setCurrentPage(1);
            setTotalPages(1);
            // Always search when price range changes (even for "All Gigs")
            searchGigs(searchQuery, 1, selectedCategory);
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

        if (searchResults.length === 0 && (searchQuery || selectedCategory || selectedSubcategory)) {
            const selectedCategoryObj = categories.find(cat => cat.id.toString() === selectedCategory);
            const selectedSubcategoryObj = selectedCategoryObj?.children?.find(sub => sub.id.toString() === selectedSubcategory);
            const searchContext = searchQuery 
                ? `"${searchQuery}"${selectedSubcategoryObj ? ` in ${selectedSubcategoryObj.name}` : selectedCategoryObj ? ` in ${selectedCategoryObj.name}` : ''}` 
                : selectedSubcategoryObj 
                    ? `in ${selectedSubcategoryObj.name}`
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
                
                {/* Hero Search Section */}
                <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12 mt-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                            Find the Perfect Service
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Discover amazing freelance services from talented professionals
                        </p>
                        
                        {/* Enhanced Search Bar */}
                        <div className="relative max-w-3xl mx-auto">
                            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="What service are you looking for today?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            setCurrentPage(1);
                                            setTotalPages(1);
                                            searchGigs(searchQuery, 1, selectedCategory);
                                            // Scroll to top after search
                                            setTimeout(() => scrollToTop(), 100);
                                        }
                                    }}
                                    className="w-full pl-6 pr-32 py-6 text-lg border-none outline-none focus:ring-0"
                                />
                                <button
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setTotalPages(1);
                                        searchGigs(searchQuery, 1, selectedCategory);
                                        // Scroll to top after search
                                        setTimeout(() => scrollToTop(), 100);
                                    }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search
                                </button>
                            </div>
                            
                            {/* Popular Searches */}
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <span className="text-gray-500 text-sm">Popular:</span>
                                {['Logo Design', 'Website Development', 'Content Writing', 'Video Editing', 'Social Media'].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => {
                                            setSearchQuery(term);
                                            setCurrentPage(1);
                                            setTotalPages(1);
                                            searchGigs(term, 1, selectedCategory);
                                            // Scroll to top after search
                                            setTimeout(() => scrollToTop(), 100);
                                        }}
                                        className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-4 py-2 rounded-full transition-colors duration-200"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Search Results Header */}
                <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {(() => {
                                        const selectedCategoryObj = categories.find(cat => cat.id.toString() === selectedCategory);
                                        const selectedSubcategoryObj = selectedCategoryObj?.children?.find(sub => sub.id.toString() === selectedSubcategory);
                                        if (selectedSubcategoryObj) {
                                            return `Gigs in ${selectedSubcategoryObj.name}`;
                                        } else if (selectedCategoryObj) {
                                            return `Gigs in ${selectedCategoryObj.name}`;
                                        } else if (searchQuery) {
                                            return "Search Results";
                                        } else {
                                            return "Most Relevant Services";
                                        }
                                    })()}
                                </h2>
                {searchQuery && (
                    <p className="text-gray-600 mt-2">
                        {(() => {
                            if (currentPage === 1 && searchResults.length < 24) {
                                // On first page with less than full results - we know the exact total
                                return `${totalResults} result${totalResults !== 1 ? 's' : ''}`;
                            } else {
                                // We have more pages or full results - show range
                                const startResult = (currentPage - 1) * 24 + 1;
                                const endResult = (currentPage - 1) * 24 + searchResults.length;
                                return `Showing ${startResult}-${endResult} of ${totalResults}+ results`;
                            }
                        })()} for "{searchQuery}"
                        {selectedSubcategory && categories.find(cat => cat.id.toString() === selectedCategory)?.children?.find(sub => sub.id.toString() === selectedSubcategory) && 
                            ` in ${categories.find(cat => cat.id.toString() === selectedCategory).children.find(sub => sub.id.toString() === selectedSubcategory).name}`
                        }
                        {!selectedSubcategory && selectedCategory && categories.find(cat => cat.id.toString() === selectedCategory) && 
                            ` in ${categories.find(cat => cat.id.toString() === selectedCategory).name}`
                        }
                    </p>
                )}
                                {!searchQuery && (selectedCategory || selectedSubcategory) && (
                                    <div className="mt-2">
                                        <p className="text-gray-600">
                                            {totalResults} gig{totalResults !== 1 ? 's' : ''} found
                                        </p>
                                        {categoryFromNavbar && selectedCategory && !selectedSubcategory && categories.find(cat => cat.id.toString() === selectedCategory)?.description && (
                                            <p className="text-gray-500 text-sm mt-1 italic">
                                                {categories.find(cat => cat.id.toString() === selectedCategory).description}
                                            </p>
                                        )}
                                        {selectedSubcategory && categories.find(cat => cat.id.toString() === selectedCategory)?.children?.find(sub => sub.id.toString() === selectedSubcategory)?.description && (
                                            <p className="text-gray-500 text-sm mt-1 italic">
                                                {categories.find(cat => cat.id.toString() === selectedCategory).children.find(sub => sub.id.toString() === selectedSubcategory).description}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {!searchQuery && !selectedCategory && !selectedSubcategory && (
                                    <div className="mt-2">
                                        <p className="text-gray-600">
                                            Showing {totalResults} most relevant services
                                        </p>
                                        <p className="text-gray-500 text-sm mt-1 italic">
                                            Discover the best freelance services tailored for you
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Filters Panel */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => {
                                                setSelectedCategory(e.target.value);
                                                setCategoryFromNavbar(false);
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

                                    {/* Subcategory Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                                        <select
                                            value={selectedSubcategory}
                                            onChange={(e) => {
                                                setSelectedSubcategory(e.target.value);
                                                setCategoryFromNavbar(false);
                                            }}
                                            disabled={!selectedCategory}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">All Subcategories</option>
                                            {selectedCategory && categories.find(cat => cat.id.toString() === selectedCategory)?.children?.map((subcategory) => (
                                                <option key={subcategory.id} value={subcategory.id}>
                                                    {subcategory.name}
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
                                            value={sort}
                                            onChange={(e) => {
                                                console.log('[SearchPage] Sort dropdown changed to:', e.target.value);
                                                setSort(e.target.value);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="relevance_desc">Most Relevant</option>
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
                                        onClick={() => {
                                            setCurrentPage(1);
                                            setTotalPages(1);
                                            searchGigs(searchQuery, 1, selectedCategory);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                    </div>
                </div>
                
                {/* Results Grid */}
                <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                            {renderGigCards()}
                        </div>
                        
                        {/* Pagination Controls */}
                        {!loading && !error && searchResults.length > 0 && totalPages > 1 && (
                            <div className="flex justify-center items-center mt-8 gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ←
                                </button>
                                
                                {/* Page Numbers */}
                                {(() => {
                                    const pages = [];
                                    const maxVisiblePages = 5;
                                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                    
                                    // Adjust start if we're near the end
                                    if (endPage - startPage + 1 < maxVisiblePages) {
                                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                    }
                                    
                                    // Show first page if not visible
                                    if (startPage > 1) {
                                        pages.push(
                                            <button
                                                key={1}
                                                onClick={() => goToPage(1)}
                                                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                1
                                            </button>
                                        );
                                        if (startPage > 2) {
                                            pages.push(<span key="start-ellipsis" className="px-2 py-2 text-gray-500">...</span>);
                                        }
                                    }
                                    
                                    // Show visible page range
                                    for (let page = startPage; page <= endPage; page++) {
                                        pages.push(
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`px-3 py-2 text-sm rounded-lg border ${
                                                    page === currentPage
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                    
                                    // Show last page if not visible
                                    if (endPage < totalPages) {
                                        if (endPage < totalPages - 1) {
                                            pages.push(<span key="end-ellipsis" className="px-2 py-2 text-gray-500">...</span>);
                                        }
                                        pages.push(
                                            <button
                                                key={totalPages}
                                                onClick={() => goToPage(totalPages)}
                                                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                {totalPages}
                                            </button>
                                        );
                                    }
                                    
                                    return pages;
                                })()}
                                
                                {/* Next Button */}
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    →
                                </button>
                            </div>
                        )}
                        
                        {/* Results Info */}
                        {!loading && !error && searchResults.length > 0 && (
                            <div className="text-center mt-4 text-sm text-gray-600">
                                Page {currentPage} of {totalPages} • Showing {searchResults.length} gigs
                            </div>
                        )}
                    </div>
                </div>
                
                <Footer />
                
                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        aria-label="Scroll to top"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
