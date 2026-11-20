import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { Loader2 } from 'lucide-react';

// Lazy load components for performance optimization
const Home = lazy(() => import('./components/Home'));
const SymptomChecker = lazy(() => import('./components/SymptomChecker'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const Consultation = lazy(() => import('./components/Consultation'));
const MentalHealthCheck = lazy(() => import('./components/MentalHealthCheck'));
const BMICalculator = lazy(() => import('./components/BMICalculator'));
const DiagnosticTool = lazy(() => import('./components/DiagnosticTool'));
const Login = lazy(() => import('./components/Login'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const DoctorDashboard = lazy(() => import('./components/DoctorDashboard'));
const DoctorProfile = lazy(() => import('./components/DoctorProfile'));
const DoctorAppointments = lazy(() => import('./components/DoctorAppointments'));
const PatientAppointments = lazy(() => import('./components/PatientAppointments'));
const PatientRecords = lazy(() => import('./components/PatientRecords'));
const HealthHistory = lazy(() => import('./components/HealthHistory'));
const EmergencySupport = lazy(() => import('./components/EmergencySupport'));

// A simple loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--accent-blue)' }}>
    <Loader2 size={48} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// Route guard for requiring login
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If not authorized for this specific role route, redirect to home or their dashboard
    return <Navigate to={role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/'} replace />;
  }

  return children;
};

// Main App Layout with Navbar (only rendered if user is logged in)
const AppLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}
      <main 
        className="main-content" 
        style={{ 
          flex: 1, 
          padding: isAuthenticated ? '3rem 2rem' : '1rem', 
          marginLeft: isAuthenticated ? '270px' : '0px', 
          transition: 'margin 0.3s ease' 
        }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginRoute />} />

            {/* Protected Routes for All Authenticated Users */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
            <Route path="/symptom-checker" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
            <Route path="/consultation" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><Consultation /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientAppointments /></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><PatientRecords /></ProtectedRoute>} />
            <Route path="/health-history" element={<ProtectedRoute><HealthHistory /></ProtectedRoute>} />
            <Route path="/emergency" element={<ProtectedRoute><EmergencySupport /></ProtectedRoute>} />
            <Route path="/mental-health" element={<ProtectedRoute><MentalHealthCheck /></ProtectedRoute>} />
            <Route path="/bmi" element={<ProtectedRoute><BMICalculator /></ProtectedRoute>} />
            <Route path="/tool/:toolId" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DiagnosticTool /></ProtectedRoute>} />

            {/* Doctor Specific Routes */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorProfile /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorAppointments /></ProtectedRoute>} />

            {/* Admin Specific Route */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

// Login Route redirect helper
const LoginRoute = () => {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/'} replace />;
  }
  return <Login />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
