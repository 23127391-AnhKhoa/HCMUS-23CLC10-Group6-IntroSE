  import React from 'react';
  import Navbar from '../components/LandingPage/Navbar_LD';
  import FeatureCard from '../components/LandingPage/FeatureCard';
  import '../index.css';

  const ProfilePage = () => {
    const profileFeatures = [
      {
        title: "Complete Your Profile",
        description: "Add details to get personalized recommendations",
        action: "Add details"
      },
      {
        title: "Business Information",
        description: "Share about your business to help us serve you better",
        action: "Add business info"
      },
      {
        title: "Communication Preferences",
        description: "Set how you want to collaborate with freelancers",
        action: "Set preferences"
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Sử dụng Navbar component đúng tên */}
        <Navbar />
        
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 hover-scale transition-smooth">
                <div className="flex flex-col items-center mb-6">
                  <div className="icon-bg bg-gray-100 mb-4">
                    <span className="text-gray-600 text-2xl">👤</span>
                  </div>
                  <h2 className="text-xl font-semibold">(fivexmem).23</h2>
                  <p className="text-gray-500 text-sm">Joined May 2025</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Vietnam</span>
                  </div>
                </div>

                <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-smooth">
                  Preview public profile
                </button>
              </div>
            </div>

            {/* Right Content - Main Profile Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 hover-scale transition-smooth">
                <div className="flex items-center mb-4 text-sm text-gray-500">
                  <span>Home /</span>
                  <span className="font-medium ml-1 text-gray-700">My Profile</span>
                </div>

                <h2 className="text-2xl font-bold mb-4">Hi! Let's help freelancers get to know you</h2>
                <p className="text-gray-600 mb-6">
                  Get the most out of Fiverr by sharing a bit more about yourself and how you prefer to work with freelancers.
                </p>
              </div>

              {/* Profile Checklist - Sử dụng FeatureCard */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Profile checklist</h3>
                
                {profileFeatures.map((feature, index) => (
                  <FeatureCard 
                    key={index}
                    title={feature.title}
                    description={feature.description}
                    actionText={feature.action}
                    showAction={true}
                    customClasses="border-l-4 border-blue-500"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default ProfilePage;