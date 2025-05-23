'use client';

import { useState } from 'react';

interface Profile {
  name: string;
  tagline: string;
  profileImage: string;
}

interface ProfileEditorProps {
  profile: Profile;
  onSave: (profile: Profile) => void;
}

export default function ProfileEditor({ profile, onSave }: ProfileEditorProps) {
  const [formData, setFormData] = useState<Profile>(profile);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof Profile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData(profile);
    setHasChanges(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
        <p className="text-gray-400">Manage your personal hub profile information</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur rounded-lg border border-gray-700 p-6">
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Name / Title
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="Enter your name or title"
            />
          </div>

          {/* Tagline Field */}
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-300 mb-2">
              Tagline
            </label>
            <input
              type="text"
              id="tagline"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="A brief description or tagline"
            />
          </div>

          {/* Profile Image Field */}
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-300 mb-2">
              Profile Image URL
            </label>
            <input
              type="url"
              id="profileImage"
              value={formData.profileImage}
              onChange={(e) => handleChange('profileImage', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="/profile.jpg or https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use a relative path (e.g., /profile.jpg) or full URL
            </p>
          </div>

          {/* Preview */}
          <div className="border-t border-gray-600 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Preview</h3>
            <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">
                  {formData.name || 'Name'}
                </h4>
                <p className="text-gray-400">
                  {formData.tagline || 'Tagline'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              💾 Save Changes
            </button>
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              ↺ Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 