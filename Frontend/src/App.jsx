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
          
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;