import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import LandingPage from './pages/LandingPage';
import AboutDeveloper from './pages/AboutDeveloper';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Events from './pages/student/Events';
import AIChat from './pages/student/AIChat';
import Certificates from './pages/student/Certificates';
import PaymentPage from './pages/student/PaymentPage';
import PaymentResult from './pages/student/PaymentResult';
import AttendanceScanner from './pages/admin/AttendanceScanner';
import Teams from './pages/student/Teams';
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace /> : <LandingPage />} />
        <Route path="/about-developer" element={<AboutDeveloper />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/student/dashboard" replace /> : <Register />} />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/events"
          element={
            <ProtectedRoute requiredRole="student">
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-events"
          element={
            <ProtectedRoute requiredRole="student">
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/certificates"
          element={
            <ProtectedRoute requiredRole="student">
              <Certificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/ai-chat"
          element={
            <ProtectedRoute requiredRole="student">
              <AIChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/payments/:id"
          element={
            <ProtectedRoute requiredRole="student">
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/payment-success"
          element={
            <ProtectedRoute requiredRole="student">
              <PaymentResult success />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/payment-failure"
          element={
            <ProtectedRoute requiredRole="student">
              <PaymentResult success={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/leaderboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/teams"
          element={
            <ProtectedRoute requiredRole="student">
              <Teams />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute requiredRole="admin">
              <AttendanceScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
