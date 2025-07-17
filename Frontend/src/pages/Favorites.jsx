import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, Clock, DollarSign } from 'lucide-react';
import NavBar from '../Common/NavBar_Buyer';
import Footer from '../Common/Footer';
import { useAuth } from '../contexts/AuthContext';

const Favorites = () => {
    const navigate = useNavigate();
    const { token, authUser, isLoading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            if (!authUser) {
                navigate('/login');
                return;
            }
            fetchFavorites();
        }
    }, [authUser, authLoading, navigate]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/api/users/favorite/${authUser.uuid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch favorites: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 'success') {
                setFavorites(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch favorites');
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (gigId) => {
        try {
            const response = await fetch('http://localhost:8000/api/users/favorite/remove', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gig_id: gigId }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove from favorites');
            }

            const data = await response.json();
            if (data.status === 'success') {
                // Remove from local state
                setFavorites(prev => prev.filter(fav => fav.gig_id !== gigId));
            }
        } catch (err) {
            console.error('Error removing favorite:', err);
            alert('Failed to remove from favorites');
        }
    };

    const handleGigClick = (gigId) => {
        navigate(`/gig/${gigId}`);
    };

    if (authLoading || loading) {
        return (
            <div className="relative flex size-full min-h-screen flex-col bg-gray-50" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative flex size-full min-h-screen flex-col bg-gray-50" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Favorites</h1>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={fetchFavorites}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="relative flex size-full min-h-screen flex-col bg-gray-50" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
            <div className="layout-container flex h-full grow flex-col">
                <NavBar />
                
                <div className="px-8 lg:px-40 flex flex-1 justify-center py-5 pt-28">
                    <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-4 px-4 pt-5 pb-8">
                            <Heart className="w-8 h-8 text-red-500" />
                            <div>
                                <h1 className="text-[#111518] text-3xl font-bold leading-tight">
                                    My Favorites
                                </h1>
                                <p className="text-[#5e7487] text-base">
                                    {favorites.length} gig{favorites.length !== 1 ? 's' : ''} saved
                                </p>
                            </div>
                        </div>

                        {/* Favorites Grid */}
                        {favorites.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center py-20">
                                <div className="text-center">
                                    <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                                    <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                                        No favorites yet
                                    </h2>
                                    <p className="text-gray-500 mb-8">
                                        Start exploring and save gigs you like to see them here
                                    </p>
                                    <button 
                                        onClick={() => navigate('/explore')}
                                        className="px-8 py-3 bg-[#1dbf73] text-white rounded-lg hover:bg-[#19a463] font-semibold"
                                    >
                                        Explore Gigs
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-8">
                                {favorites.map((favorite) => (
                                    <div 
                                        key={favorite.gig_id} 
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group cursor-pointer"
                                        onClick={() => handleGigClick(favorite.gig_id)}
                                    >
                                        {/* Gig Image */}
                                        <div className="relative">
                                            <div
                                                className="w-full h-48 bg-center bg-cover"
                                                style={{
                                                    backgroundImage: `url("${favorite.Gigs?.cover_image || 'https://placehold.co/400x300'}")`
                                                }}
                                            ></div>
                                            
                                            {/* Remove button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFavorite(favorite.gig_id);
                                                }}
                                                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                title="Remove from favorites"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Gig Info */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-[#1dbf73] transition-colors">
                                                {favorite.Gigs?.title || 'Untitled Gig'}
                                            </h3>
                                            
                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <DollarSign className="w-4 h-4 text-[#1dbf73]" />
                                                <span className="text-xl font-bold text-[#1dbf73]">
                                                    {favorite.Gigs?.price || 0}
                                                </span>
                                            </div>

                                            {/* Date Added */}
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    Added {new Date(favorite.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="px-4 pb-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleGigClick(favorite.gig_id);
                                                }}
                                                className="w-full py-2 bg-[#1dbf73] text-white rounded-lg hover:bg-[#19a463] font-semibold transition-colors duration-200"
                                            >
                                                View Gig
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <Footer />
            </div>
        </div>
    );
};

export default Favorites;
