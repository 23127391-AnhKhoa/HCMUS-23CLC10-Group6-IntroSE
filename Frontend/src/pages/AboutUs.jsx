import React from 'react';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

import NavBar from '../Common/Navbar_LD';
import Footer from '../Common/Footer';
// --- Component Chính: AboutUs ---
const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar/>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                            About FreeLand
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            Connecting talented freelancers with clients worldwide to create extraordinary digital experiences
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Our Mission
                        </h2>
                        <p className="text-lg text-gray-600 mb-4 max-w-3xl mx-auto">
                            At FreeLand, we believe in the power of freelance talent to transform businesses and create meaningful work opportunities. Our platform connects skilled professionals with clients who need their expertise.
                        </p>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            We're committed to building a trusted, secure, and efficient marketplace where quality work meets fair compensation, enabling both freelancers and clients to achieve their goals.
                        </p>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Description on the left */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Meet Our Team
                            </h2>
                            <p className="text-lg text-gray-600 mb-4">
                                The passionate individuals behind FreeLand's success. We are a diverse group of designers, developers, and strategists dedicated to building the future of freelance work.
                            </p>
                            <p className="text-lg text-gray-600">
                                Our collective experience and commitment to our community drive us to innovate and create a platform that truly empowers both freelancers and clients. We're here to support your journey to success.
                            </p>
                        </div>
                        {/* Image on the right */}
                        <div className="rounded-lg overflow-hidden shadow-2xl">
                            <img 
                                src="/Team.png" 
                                alt="Our Team" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutUs;
