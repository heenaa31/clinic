import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import DoctorDashboard from './pages/DoctorDashboard';

export default function App() {
  const { auth, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            auth
              ? <Navigate to={auth.user.role === 'admin' ? '/admin' : '/dashboard'} replace />
              : <LoginPage onLogin={login} />
          }
        />
        <Route
          path="/admin"
          element={
            !auth
              ? <Navigate to="/" replace />
              : auth.user.role !== 'admin'
              ? <Navigate to="/dashboard" replace />
              : <AdminPage auth={auth} onLogout={logout} />
          }
        />
        <Route
          path="/dashboard"
          element={
            !auth
              ? <Navigate to="/" replace />
              : auth.user.role !== 'doctor'
              ? <Navigate to="/admin" replace />
              : <DoctorDashboard auth={auth} onLogout={logout} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
