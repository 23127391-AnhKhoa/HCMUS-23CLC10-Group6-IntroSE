import React from 'react';
import Navbar from '../components/LandingPage/Navbar_LD';
import HeroSection from '../components/LandingPage//HeroSection';
import FeaturesSection from '../components/LandingPage/FeaturesSection';
import NavBar_login from'../components/Login/NavBar_login';
import '../index.css';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
    </div>
  );
};

export default LandingPage;