'use client';

import React, { useState } from 'react';
import { Widget, QuickLink } from '../../../types/dashboard';

interface WidgetEditorProps {
  widget: Widget;
  categories: Array<{
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
  }>;
  onSave: (widget: Widget) => void;
  onClose: () => void;
}

export default function WidgetEditor({ widget, categories, onSave, onClose }: WidgetEditorProps) {
  const [editedWidget, setEditedWidget] = useState<Widget>({ ...widget });

  const handleSave = () => {
    onSave(editedWidget);
  };

  const updateConfig = (key: string, value: any) => {
    setEditedWidget(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
  };

  const updateTitle = (title: string) => {
    setEditedWidget(prev => ({
      ...prev,
      title
    }));
  };

  const addQuickLink = () => {
    const links = editedWidget.config.links || [];
    const newLink: QuickLink = {
      id: `link-${Date.now()}`,
      title: 'New Link',
      url: 'https://example.com',
      icon: '🔗',
      color: 'blue'
    };
    updateConfig('links', [...links, newLink]);
  };

  const updateQuickLink = (linkId: string, field: string, value: string) => {
    const links = editedWidget.config.links || [];
    const updatedLinks = links.map((link: QuickLink) =>
      link.id === linkId ? { ...link, [field]: value } : link
    );
    updateConfig('links', updatedLinks);
  };

  const removeQuickLink = (linkId: string) => {
    const links = editedWidget.config.links || [];
    updateConfig('links', links.filter((link: QuickLink) => link.id !== linkId));
  };

  const renderWidgetSpecificConfig = () => {
    switch (editedWidget.type) {
      case 'category-links':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={editedWidget.config.categoryId || ''}
                onChange={(e) => updateConfig('categoryId', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editedWidget.config.showTitle !== false}
                  onChange={(e) => updateConfig('showTitle', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Show category title</span>
              </label>
            </div>
          </div>
        );

      case 'quick-links':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">Quick Links</h4>
              <button
                onClick={addQuickLink}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                + Add Link
              </button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {(editedWidget.config.links || []).map((link: QuickLink) => (
                <div key={link.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateQuickLink(link.id, 'title', e.target.value)}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Icon</label>
                      <input
                        type="text"
                        value={link.icon}
                        onChange={(e) => updateQuickLink(link.id, 'icon', e.target.value)}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        placeholder="🔗"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">URL</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateQuickLink(link.id, 'url', e.target.value)}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Color</label>
                      <select
                        value={link.color}
                        onChange={(e) => updateQuickLink(link.id, 'color', e.target.value)}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                      >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="red">Red</option>
                        <option value="yellow">Yellow</option>
                        <option value="purple">Purple</option>
                        <option value="pink">Pink</option>
                        <option value="indigo">Indigo</option>
                        <option value="cyan">Cyan</option>
                        <option value="orange">Orange</option>
                        <option value="gray">Gray</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeQuickLink(link.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'text-block':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={editedWidget.config.content || ''}
                onChange={(e) => updateConfig('content', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-32"
                placeholder="Enter your text content here..."
              />
            </div>
          </div>
        );

      case 'weather':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={editedWidget.config.location || '02889'}
                onChange={(e) => updateConfig('location', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Enter location (e.g., 02889, New York, London, coordinates)"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 You can use zip codes, city names, coordinates, or addresses. Data is cached for 10 minutes to respect API limits.
              </p>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <h5 className="text-blue-400 font-medium mb-2">📡 API Usage Info</h5>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• Using Tomorrow.io API (Free Plan)</div>
                <div>• Rate Limits: 500/day, 25/hour, 3/second</div>
                <div>• Data cached for efficiency</div>
                <div>• Weather updates every 10 minutes</div>
              </div>
            </div>
          </div>
        );

      case 'clock':
        return (
          <div className="text-gray-400 text-center py-4">
            No configuration options for clock widget.
          </div>
        );

      default:
        return (
          <div className="text-gray-400 text-center py-4">
            Configuration options coming soon for this widget type.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-white">Edit Widget</h3>
            <p className="text-gray-400 text-sm">Configure your widget settings</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Settings */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Basic Settings</h4>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Widget Title
              </label>
              <input
                type="text"
                value={editedWidget.title}
                onChange={(e) => updateTitle(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Enter widget title"
              />
            </div>
          </div>

          {/* Widget-Specific Configuration */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Widget Configuration</h4>
            {renderWidgetSpecificConfig()}
          </div>

          {/* Appearance Settings */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Appearance</h4>
            <div className="space-y-3">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editedWidget.config.showBorder || false}
                    onChange={(e) => updateConfig('showBorder', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">Show border</span>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={editedWidget.config.backgroundColor || '#374151'}
                    onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    className="w-full h-10 bg-gray-600 border border-gray-500 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={editedWidget.config.textColor || '#ffffff'}
                    onChange={(e) => updateConfig('textColor', e.target.value)}
                    className="w-full h-10 bg-gray-600 border border-gray-500 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 