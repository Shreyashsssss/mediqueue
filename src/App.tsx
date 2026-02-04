
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserRole } from './types';
import { clinicStore } from './store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

// Role-based Dashboard Wrapper
const DashboardRouter = () => {
  const user = clinicStore.getCurrentUser();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    clinicStore.logout();
    navigate('/login');
  };

  switch (user.role) {
    case UserRole.PATIENT:
      return <PatientDashboard user={user} onLogout={handleLogout} />;
    case UserRole.STAFF:
      return <StaffDashboard user={user} onLogout={handleLogout} />;
    case UserRole.DOCTOR:
      return <DoctorDashboard user={user} onLogout={handleLogout} />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
