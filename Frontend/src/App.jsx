import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NewsPage from './pages/NewsPage';
import SignupPage from './pages/SignupPage'; // New placeholder for signup

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route for the homepage */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Route for login page */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Route for news page */}
          <Route path="/news" element={<NewsPage />} />
          
          {/* Route for signup page */}
          <Route path="/signup" element={<SignupPage />} />
          
          {/* 404 Route for unmatched paths */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <h1 className="text-2xl font-semibold text-gray-600">404 - Page Not Found</h1>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;