import React from 'react';
import Navbar from '../components/LandingPage/Navbar_LD';
import HeroSection from '../components/LandingPage//HeroSection';
import FeaturesSection from '../components/LandingPage/FeaturesSection';
import Footer from '../Common/Footer';
import '../index.css';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer/>
    </div>
  );
};

export default LandingPage;