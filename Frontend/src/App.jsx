import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Introduction from './pages/Introduction';
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
import WalletPage from './pages/WalletPage';
import Favorites from './pages/Favorites';
import SearchPage from './pages/SearchPage';
import ServicesManagement from './pages/Admin/ServiceManagement';
import GigDetailContent from './pages/Admin/AdminGigContent';
import AdminSellerInfor from './pages/Admin/AdminSellerInfor'; // Updated import for AdminSellerInfo
import ManageReportedGigs from './pages/Admin/ManageReportedGigs'; // Import the new ManageReportedGigs component
import ReportUserPage from './pages/ReportUserPage';
<<<<<<< HEAD

=======
>>>>>>> 550d3eabfba22ef8e0492cb05640bd9832589265
import ReportGigPage from './pages/ReportGigPage'; // Assuming you have a ReportGigPage component
>>>>>>> a346e2610e188df9f09c71a5ab1220dbab9ab70b
function App() {
  return (
    <AuthProvider>
      <Router>
        
        <div className="App">
          <Routes>
            {/* Route for the introduction page */}
            <Route path="/" element={<Introduction />} />

            <Route path="admin/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/admin/manage-reported-gigs" element={<ManageReportedGigs />} />
            {/* Route for signup page */}
            
            {/* Route for authentication page */}
            <Route path="/auth" element={<AuthPage />} />

            <Route path="/admin/servicemanagement" element={<ServicesManagement />} />
            {/*ROUTE FOR CREATE GIGS*/}
            <Route path="/create-gig" element={<CreateGigsPage />} />
            
            <Route path="/explore" element={<ExplorePage />} />

            <Route path="/search" element={<SearchPage />} />

            <Route path="/admin/Usermanagement" element={<UserManagement />} />

            <Route path="/gig/:id" element={<GigDetail />} />
            <Route path="/admin/gig/:id" element={<GigDetailContent />} />

            {/* Profile routes */}
            <Route path="/profile_buyer" element={<ProfileBuyer />} />
            
            <Route path="/profile_seller" element={<ProfileSeller />} />

            <Route path="/dashboard" element={<ProfileSeller />} />

            <Route path="/earnings" element={<EarningsPage />} />

            <Route path="/orders" element={<Orders />} />

            <Route path="/manage-gigs" element={<ManageGigs />} />

            <Route path="/seller/gigs" element={<CreateGigsPage />} />

            <Route path="/become-seller" element={<BecomeSellerPage />} />

            <Route path="/deposit" element={<WalletPage />} />

            <Route path="/withdraw" element={<WalletPage />} />

            <Route path="/wallet" element={<WalletPage />} />

            <Route path="/inbox" element={<InboxPage />} />

            <Route path="/messages" element={<InboxPage />} />
            <Route path="/admin/seller/:sellerId" element={<AdminSellerInfor />} />

            {/* Admin routes */}
            <Route path="/SellerInfo/:sellerId" element={<SellerInfo />} />

            <Route path="/favorites" element={<Favorites />} />

            <Route path="/report-user" element={<ReportUserPage />} />

            <Route path="/report-gig" element={<ReportGigPage />} />

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