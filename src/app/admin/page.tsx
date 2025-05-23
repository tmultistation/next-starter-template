'use client';

import { useUser } from '@clerk/nextjs';
import AdminDashboard from './components/AdminDashboard';

export default function AdminPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to sign in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-400 mb-8">You need to be signed in to customize your dashboard.</p>
          <div className="text-sm text-gray-500 mb-4">
            Go back to the <a href="/" className="text-purple-400 hover:text-purple-300">main page</a> and click &quot;Sign In&quot; to continue.
          </div>
          <div className="text-xs text-gray-600">
            Authentication is powered by Clerk for secure access.
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show admin dashboard
  return <AdminDashboard />;
} 