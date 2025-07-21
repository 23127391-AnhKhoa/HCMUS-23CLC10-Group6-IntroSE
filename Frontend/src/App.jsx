import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Introduction from './pages/Introduction';
import SignupPage from './pages/SignupPage'; // New placeholder for signup
import CreateGigsPage from './pages/Create_Gigs';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ExplorePage from './pages/ExplorePage';
import GigDetail from './pages/GigDetail';
import ProfileBuyer from './pages/Profile_Buyer';
import ProfileSeller from './pages/Profile_Seller';
import EarningsPage from './pages/EarningsPage';
import ManageGigs from './pages/ManageGigs';
import Orders from './pages/Orders';
import InboxPage from './pages/InboxPage';
import SellerInfo from './pages/SellerInfo';
import Footer from './Common/Footer';
import BecomeSellerPage from './pages/BecomeSeller';
import UserManagement from './pages/Admin/UserManagement';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import Favorites from './pages/Favorites';
import SearchPage from './pages/SearchPage';
import ServicesManagement from './pages/Admin/ServiceManagement';
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

            <Route path="admin/AdminDashboard" element={<AdminDashboard />} />
            
            {/* Route for signup page */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin/servicemanagement" element={<ServicesManagement />} />
            {/*ROUTE FOR CREATE GIGS*/}
            <Route path="/create-gig" element={<CreateGigsPage />} />
            
            <Route path="/explore" element={<ExplorePage />} />

            <Route path="/search" element={<SearchPage />} />

            <Route path="/admin/Usermanagement" element={<UserManagement />} />
            <Route path="/gig/:id" element={<GigDetail />} />

            <Route path="/profile_buyer" element={<ProfileBuyer />} />

            <Route path="/profile_seller" element={<ProfileSeller />} />

            <Route path="/dashboard" element={<ProfileSeller />} />

            <Route path="/earnings" element={<EarningsPage />} />

            <Route path="/orders" element={<Orders />} />

            <Route path="/manage-gigs" element={<ManageGigs />} />

            <Route path="/seller/gigs" element={<CreateGigsPage />} />

            <Route path="/become-seller" element={<BecomeSellerPage />} />

            <Route path="/deposit" element={<DepositPage />} />

            <Route path="/withdraw" element={<WithdrawPage />} />

            <Route path="/inbox" element={<InboxPage />} />

            <Route path="/messages" element={<InboxPage />} />

            <Route path="/SellerInfo/:sellerId" element={<SellerInfo />} />

            <Route path="/favorites" element={<Favorites />} />

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