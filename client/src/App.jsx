import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReportFormPage from './pages/ReportFormPage';
import ReportDetailPage from './pages/ReportDetailPage';
import RewardsPage from './pages/RewardsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

import { AuthProvider } from './context/AuthContext';
import { ReportProvider } from './context/ReportContext';
import { RewardProvider } from './context/RewardContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ReportProvider>
          <RewardProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow mt-4">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/report/new" element={<ReportFormPage />} />
                  <Route path="/report/:id" element={<ReportDetailPage />} />
                  <Route path="/report/edit/:id" element={<ReportFormPage />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </RewardProvider>
        </ReportProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
