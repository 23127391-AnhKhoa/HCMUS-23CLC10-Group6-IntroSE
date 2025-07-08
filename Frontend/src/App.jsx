import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Introduction from './pages/Introduction';
import SignupPage from './pages/SignupPage'; // New placeholder for signup
import CreateGigsPage from './pages/Create_Gigs';
import AdminDashboard from './pages/AdminDashboard';
import ExplorePage from './pages/ExplorePage';
import GigDetail from './pages/GigDetail';
import ProfileBuyer from './pages/Profile_Buyer';
import ProfileSeller from './pages/Profile_Seller';
import Footer from './Common/Footer';
import BecomeSellerPage from './pages/BecomeSeller';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        
        <div className="App">
          <Routes>
            {/* Route for news page */}
            

            {/* Route for the introduction page */}
            <Route path="/" element={<Introduction />} />

            {/* Route for login page */}
            <Route path="/login" element={<LoginPage />} />

            <Route path="/adminDashboard" element={<AdminDashboard />} />
            
            {/* Route for signup page */}
            <Route path="/signup" element={<SignupPage />} />

            {/*ROUTE FOR CREATE GIGS*/}
            <Route path="/create-gig" element={<CreateGigsPage />} />
            
            <Route path="/explore" element={<ExplorePage />} />

            <Route path="/gig/:id" element={<GigDetail />} />

            <Route path="/profile_buyer" element={<ProfileBuyer />} />

            <Route path="/profile_seller" element={<ProfileSeller />} />

            <Route path="/become-seller" element={<BecomeSellerPage />} />

            <Route path="/deposit" element={<DepositPage />} />

            <Route path="/withdraw" element={<WithdrawPage />} />
            {/* 404 Route for unmatched paths */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <h1 className="text-2xl font-semibold text-gray-600">404 - Page Not Found</h1>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;