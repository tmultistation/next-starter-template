'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import { DashboardLayout } from '../types/dashboard';

interface Link {
  id: string;
  title: string;
  url: string;
  emoji: string;
  color: string;
}

interface Category {
  id: string;
  title: string;
  emoji: string;
  color: string;
  links: Link[];
}

interface HubContent {
  profile: {
    name: string;
    tagline: string;
    profileImage: string;
  };
  categories: Category[];
  dashboards?: DashboardLayout[];
  currentDashboard?: string;
}

export default function Home() {
  const { isSignedIn } = useUser();
  const [data, setData] = useState<HubContent | null>(null);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/hub-content');
        if (response.ok) {
          const content: HubContent = await response.json();
          setData(content);
          
          // Set current dashboard layout or create a default fallback
          if (content.dashboards && content.dashboards.length > 0) {
            const dashboardId = content.currentDashboard || content.dashboards[0].id;
            const layout = content.dashboards.find(d => d.id === dashboardId);
            setCurrentLayout(layout || null);
          } else {
            // Create a default dashboard with category widgets if no dashboard exists
            setCurrentLayout(createFallbackDashboard(content.categories || []));
          }
        }
      } catch (error) {
        console.error('Failed to load hub content:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const createFallbackDashboard = (categories: Category[]): DashboardLayout => {
    const widgets = categories.slice(0, 6).map((category, index) => ({
      id: `fallback-widget-${category.id}`,
      type: 'category-links' as const,
      title: category.title,
      config: {
        categoryId: category.id,
        showTitle: true
      },
      position: {
        row: Math.floor(index / 3),
        column: index % 3
      }
    }));

    return {
      id: 'fallback-dashboard',
      name: 'Default Dashboard',
      widgets,
      rows: [
        {
          id: 'row-1',
          columns: [
            { id: 'col-1-1', width: 4, widgets: [] },
            { id: 'col-1-2', width: 4, widgets: [] },
            { id: 'col-1-3', width: 4, widgets: [] }
          ]
        },
        {
          id: 'row-2',
          columns: [
            { id: 'col-2-1', width: 4, widgets: [] },
            { id: 'col-2-2', width: 4, widgets: [] },
            { id: 'col-2-3', width: 4, widgets: [] }
          ]
        }
      ]
    };
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-xl">Loading your personal hub...</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-xl">Failed to load hub content</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-500 group cursor-pointer">
            <Image
              src={data.profile.profileImage}
              alt="Profile Picture"
              fill
              className="object-cover"
              priority
            />
            {/* Semi-hidden admin button - only for authenticated users */}
            {isSignedIn && (
              <a 
                href="/admin"
                className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                title="Access Admin Panel"
              >
                <div className="text-white text-lg transform scale-0 group-hover:scale-100 transition-transform duration-200">
                  🎛️
                </div>
              </a>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{data.profile.name}</h1>
          <p className="text-gray-400 mb-4">{data.profile.tagline}</p>
          
          {/* Sign In Link - only for unauthenticated users */}
          <div className="flex items-center justify-center">
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-300 rounded-lg transition-all duration-200 text-sm">
                  🔐 Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        {currentLayout ? (
          <DashboardGrid
            layout={currentLayout}
            categories={data.categories || []}
            isEditing={false}
          />
        ) : (
          <div className="text-center py-12 bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-600">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Dashboard Configured</h3>
            <p className="text-gray-400 mb-4">Create your first dashboard widgets</p>
            {isSignedIn && (
              <a
                href="/admin"
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                🎛️ Go to Admin Panel
              </a>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Personal Hub • Last updated {new Date().toLocaleDateString()}</p>
        </footer>
      </div>
    </main>
  );
}
