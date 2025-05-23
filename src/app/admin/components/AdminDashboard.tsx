'use client';

import { useState, useEffect } from 'react';
import ProfileEditor from './ProfileEditor';
import DashboardEditor from './DashboardEditor';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface Category {
  id: string;
  title: string;
  emoji: string;
  color: string;
  links: Array<{
    id: string;
    title: string;
    url: string;
    emoji: string;
    color: string;
  }>;
}

interface HubContent {
  profile: {
    name: string;
    tagline: string;
    profileImage: string;
  };
  categories: Category[];
  dashboards?: any[];
  currentDashboard?: string;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<HubContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/hub-content');
      if (response.ok) {
        const content: HubContent = await response.json();
        setData(content);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (newData: HubContent) => {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/hub-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        setData(newData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save data:', error);
      setSaveStatus('error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Failed to load data</div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'profile', name: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">🎛️ Personal Hub CMS</h1>
            {saveStatus !== 'idle' && (
              <div className={`px-3 py-1 rounded-full text-sm ${
                saveStatus === 'saving' ? 'bg-blue-500/20 text-blue-300' :
                saveStatus === 'saved' ? 'bg-green-500/20 text-green-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {saveStatus === 'saving' ? '💾 Saving...' :
                 saveStatus === 'saved' ? '✅ Saved' :
                 '❌ Error saving'}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              🏠 View Hub
            </a>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'dashboard' && (
          <DashboardEditor
            hubContent={data}
            onSave={saveData}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileEditor
            profile={data.profile}
            onSave={(newProfile) => saveData({ ...data, profile: newProfile })}
          />
        )}
      </div>
    </div>
  );
} 