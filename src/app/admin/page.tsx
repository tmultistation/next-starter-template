'use client';

import { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import PinAuth from './components/PinAuth';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated (session storage)
    const authStatus = sessionStorage.getItem('admin-authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleAuthentication = (success: boolean) => {
    setIsAuthenticated(success);
    if (success) {
      sessionStorage.setItem('admin-authenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin-authenticated');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PinAuth onAuthenticated={handleAuthentication} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
} 