import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
// import { Signup } from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const token = localStorage.getItem('token');
  return !token ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
      <Router>
    <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/signup" element={<Signup />} /> */}
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Add other protected routes here */}
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer position="top-right" />
    </AuthProvider>
      </Router>
  );
};

export default App;