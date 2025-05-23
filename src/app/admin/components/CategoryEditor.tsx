'use client';

import { useState } from 'react';

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

interface CategoryEditorProps {
  categories: Category[];
  onSave: (categories: Category[]) => void;
}

export default function CategoryEditor({ categories, onSave }: CategoryEditorProps) {
  const [editingCategories, setEditingCategories] = useState<Category[]>(categories);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryChange = (categoryId: string, field: keyof Category, value: string) => {
    setEditingCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    ));
    setHasChanges(true);
  };

  const handleLinkChange = (categoryId: string, linkId: string, field: keyof Link, value: string) => {
    setEditingCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            links: cat.links.map(link => 
              link.id === linkId ? { ...link, [field]: value } : link
            )
          }
        : cat
    ));
    setHasChanges(true);
  };

  const addLink = (categoryId: string) => {
    const newLink: Link = {
      id: `link_${Date.now()}`,
      title: 'New Link',
      url: 'https://example.com',
      emoji: '🔗',
      color: 'blue'
    };

    setEditingCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, links: [...cat.links, newLink] }
        : cat
    ));
    setHasChanges(true);
  };

  const removeLink = (categoryId: string, linkId: string) => {
    setEditingCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, links: cat.links.filter(link => link.id !== linkId) }
        : cat
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(editingCategories);
    setHasChanges(false);
  };

  const handleReset = () => {
    setEditingCategories(categories);
    setHasChanges(false);
  };

  const colorOptions = [
    'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'cyan', 'orange', 'gray', 'black'
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Category Management</h2>
        <p className="text-gray-400">Manage your hub categories and links</p>
      </div>

      <div className="space-y-6">
        {editingCategories.map((category) => (
          <div key={category.id} className="bg-gray-800/50 backdrop-blur rounded-lg border border-gray-700">
            {/* Category Header */}
            <div className="p-6 border-b border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <span className="mr-2">{category.emoji}</span>
                  {category.title}
                </h3>
                <button
                  onClick={() => setExpandedCategory(
                    expandedCategory === category.id ? null : category.id
                  )}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedCategory === category.id ? '▼' : '▶'}
                </button>
              </div>

              {expandedCategory === category.id && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category Title
                    </label>
                    <input
                      type="text"
                      value={category.title}
                      onChange={(e) => handleCategoryChange(category.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={category.emoji}
                      onChange={(e) => handleCategoryChange(category.id, 'emoji', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Color
                    </label>
                    <select
                      value={category.color}
                      onChange={(e) => handleCategoryChange(category.id, 'color', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                    >
                      {colorOptions.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Links ({category.links.length})</h4>
                <button
                  onClick={() => addLink(category.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  + Add Link
                </button>
              </div>

              <div className="space-y-4">
                {category.links.map((link) => (
                  <div key={link.id} className="bg-gray-700/30 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleLinkChange(category.id, link.id, 'title', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-600/50 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">URL</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleLinkChange(category.id, link.id, 'url', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-600/50 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Emoji</label>
                        <input
                          type="text"
                          value={link.emoji}
                          onChange={(e) => handleLinkChange(category.id, link.id, 'emoji', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-600/50 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Color</label>
                          <select
                            value={link.color}
                            onChange={(e) => handleLinkChange(category.id, link.id, 'color', e.target.value)}
                            className="w-full px-2 py-1 bg-gray-600/50 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                          >
                            {colorOptions.map(color => (
                              <option key={color} value={color}>{color}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => removeLink(category.id, link.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-6">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
        >
          💾 Save All Changes
        </button>
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
        >
          ↺ Reset All
        </button>
      </div>
    </div>
  );
} 