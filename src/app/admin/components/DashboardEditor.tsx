'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout, Widget, WidgetType, LayoutRow } from '../../../types/dashboard';
import DashboardGrid from '../../../components/dashboard/DashboardGrid';
import WidgetPalette from './WidgetPalette';
import WidgetEditor from './WidgetEditor';

interface DashboardEditorProps {
  hubContent: any;
  onSave?: (content: any) => void;
}

// Predefined layout templates
const LAYOUT_TEMPLATES = [
  { id: '1-col', name: '1 Column', columns: [{ width: 12 }] },
  { id: '2-col-equal', name: '2 Equal Columns', columns: [{ width: 6 }, { width: 6 }] },
  { id: '2-col-left', name: '2 Columns (Left Heavy)', columns: [{ width: 8 }, { width: 4 }] },
  { id: '2-col-right', name: '2 Columns (Right Heavy)', columns: [{ width: 4 }, { width: 8 }] },
  { id: '3-col-equal', name: '3 Equal Columns', columns: [{ width: 4 }, { width: 4 }, { width: 4 }] },
  { id: '3-col-center', name: '3 Columns (Center Heavy)', columns: [{ width: 3 }, { width: 6 }, { width: 3 }] },
  { id: '4-col-equal', name: '4 Equal Columns', columns: [{ width: 3 }, { width: 3 }, { width: 3 }, { width: 3 }] },
  { id: '1-3-split', name: '1/3 - 2/3 Split', columns: [{ width: 4 }, { width: 8 }] },
  { id: '2-3-split', name: '2/3 - 1/3 Split', columns: [{ width: 8 }, { width: 4 }] },
];

export default function DashboardEditor({ hubContent, onSave }: DashboardEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [showWidgetPalette, setShowWidgetPalette] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const [categories, setCategories] = useState(hubContent.categories || []);

  // Initialize with a default layout if none exists
  useEffect(() => {
    if (hubContent.dashboards && hubContent.dashboards.length > 0) {
      const dashboardId = hubContent.currentDashboard || hubContent.dashboards[0].id;
      const layout = hubContent.dashboards.find((d: DashboardLayout) => d.id === dashboardId);
      setCurrentLayout(layout || createDefaultLayout());
    } else {
      setCurrentLayout(createDefaultLayout());
    }
    setCategories(hubContent.categories || []);
  }, [hubContent]);

  const createDefaultLayout = (): DashboardLayout => ({
    id: 'default',
    name: 'My Dashboard',
    widgets: [],
    rows: [
      {
        id: 'row-1',
        columns: [
          { id: 'col-1-1', width: 6, widgets: [] },
          { id: 'col-1-2', width: 6, widgets: [] }
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
  });

  const addRow = (templateId: string) => {
    if (!currentLayout) return;

    const template = LAYOUT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newRowIndex = currentLayout.rows.length;
    const newRow: LayoutRow = {
      id: `row-${Date.now()}`,
      columns: template.columns.map((col, index) => ({
        id: `col-${newRowIndex}-${index}`,
        width: col.width,
        widgets: []
      }))
    };

    const updatedLayout = {
      ...currentLayout,
      rows: [...currentLayout.rows, newRow]
    };

    setCurrentLayout(updatedLayout);
  };

  const updateRowLayout = (rowIndex: number, templateId: string) => {
    if (!currentLayout) return;

    const template = LAYOUT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Get widgets currently in this row
    const rowWidgets = currentLayout.widgets.filter(w => w.position.row === rowIndex);
    
    // Remove widgets that won't fit in the new layout
    const maxColumns = template.columns.length;
    const widgetsToKeep = rowWidgets.filter(w => w.position.column < maxColumns);
    const widgetsToRemove = rowWidgets.filter(w => w.position.column >= maxColumns);

    // Create new row structure
    const updatedRow: LayoutRow = {
      ...currentLayout.rows[rowIndex],
      columns: template.columns.map((col, index) => ({
        id: `col-${rowIndex}-${index}`,
        width: col.width,
        widgets: []
      }))
    };

    const updatedLayout = {
      ...currentLayout,
      rows: currentLayout.rows.map((row, index) => 
        index === rowIndex ? updatedRow : row
      ),
      widgets: [
        ...currentLayout.widgets.filter(w => w.position.row !== rowIndex),
        ...widgetsToKeep
      ]
    };

    setCurrentLayout(updatedLayout);

    // Notify user if widgets were removed
    if (widgetsToRemove.length > 0) {
      alert(`${widgetsToRemove.length} widget(s) were removed because they don't fit in the new layout.`);
    }
  };

  const removeRow = (rowIndex: number) => {
    if (!currentLayout) return;

    // Remove widgets in this row
    const widgetsToRemove = currentLayout.widgets.filter(w => w.position.row === rowIndex);
    
    // Confirm deletion if row has widgets
    if (widgetsToRemove.length > 0) {
      const confirmed = confirm(`This row contains ${widgetsToRemove.length} widget(s). Are you sure you want to delete it?`);
      if (!confirmed) return;
    }

    // Update widget positions for rows below
    const updatedWidgets = currentLayout.widgets
      .filter(w => w.position.row !== rowIndex)
      .map(w => ({
        ...w,
        position: {
          ...w.position,
          row: w.position.row > rowIndex ? w.position.row - 1 : w.position.row
        }
      }));

    const updatedLayout = {
      ...currentLayout,
      rows: currentLayout.rows.filter((_, index) => index !== rowIndex),
      widgets: updatedWidgets
    };

    setCurrentLayout(updatedLayout);
  };

  const moveRowUp = (rowIndex: number) => {
    if (!currentLayout || rowIndex === 0) return;

    const updatedRows = [...currentLayout.rows];
    [updatedRows[rowIndex - 1], updatedRows[rowIndex]] = [updatedRows[rowIndex], updatedRows[rowIndex - 1]];

    // Update widget positions
    const updatedWidgets = currentLayout.widgets.map(widget => {
      if (widget.position.row === rowIndex) {
        return { ...widget, position: { ...widget.position, row: rowIndex - 1 } };
      } else if (widget.position.row === rowIndex - 1) {
        return { ...widget, position: { ...widget.position, row: rowIndex } };
      }
      return widget;
    });

    setCurrentLayout({
      ...currentLayout,
      rows: updatedRows,
      widgets: updatedWidgets
    });
  };

  const moveRowDown = (rowIndex: number) => {
    if (!currentLayout || rowIndex >= currentLayout.rows.length - 1) return;

    const updatedRows = [...currentLayout.rows];
    [updatedRows[rowIndex], updatedRows[rowIndex + 1]] = [updatedRows[rowIndex + 1], updatedRows[rowIndex]];

    // Update widget positions
    const updatedWidgets = currentLayout.widgets.map(widget => {
      if (widget.position.row === rowIndex) {
        return { ...widget, position: { ...widget.position, row: rowIndex + 1 } };
      } else if (widget.position.row === rowIndex + 1) {
        return { ...widget, position: { ...widget.position, row: rowIndex } };
      }
      return widget;
    });

    setCurrentLayout({
      ...currentLayout,
      rows: updatedRows,
      widgets: updatedWidgets
    });
  };

  const handleAddWidget = (type: WidgetType, rowIndex: number, columnIndex: number) => {
    if (!currentLayout) return;

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: getDefaultWidgetTitle(type),
      config: getDefaultWidgetConfig(type),
      position: { row: rowIndex, column: columnIndex }
    };

    const updatedLayout = {
      ...currentLayout,
      widgets: [...currentLayout.widgets, newWidget]
    };

    setCurrentLayout(updatedLayout);
    setShowWidgetPalette(false);
  };

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!currentLayout) return;

    const updatedLayout = {
      ...currentLayout,
      widgets: currentLayout.widgets.filter(w => w.id !== widgetId)
    };

    setCurrentLayout(updatedLayout);
  };

  const handleSaveWidget = (updatedWidget: Widget) => {
    if (!currentLayout) return;

    const updatedLayout = {
      ...currentLayout,
      widgets: currentLayout.widgets.map(w => 
        w.id === updatedWidget.id ? updatedWidget : w
      )
    };

    setCurrentLayout(updatedLayout);
    setEditingWidget(null);
  };

  const handleSaveDashboard = async () => {
    if (!currentLayout || !onSave) return;

    const updatedContent = {
      ...hubContent,
      categories,
      dashboards: hubContent.dashboards 
        ? hubContent.dashboards.map((d: DashboardLayout) => 
            d.id === currentLayout.id ? currentLayout : d
          )
        : [currentLayout],
      currentDashboard: currentLayout.id
    };

    await onSave(updatedContent);
  };

  const addCategory = () => {
    const newCategory = {
      id: `category_${Date.now()}`,
      title: 'New Category',
      emoji: '📂',
      color: 'blue',
      links: []
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (categoryId: string, field: string, value: string) => {
    setCategories(categories.map((cat: any) => 
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    ));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter((cat: any) => cat.id !== categoryId));
  };

  const addLink = (categoryId: string) => {
    const newLink = {
      id: `link_${Date.now()}`,
      title: 'New Link',
      url: 'https://example.com',
      emoji: '🔗',
      color: 'blue'
    };

    setCategories(categories.map((cat: any) => 
      cat.id === categoryId 
        ? { ...cat, links: [...cat.links, newLink] }
        : cat
    ));
  };

  const updateLink = (categoryId: string, linkId: string, field: string, value: string) => {
    setCategories(categories.map((cat: any) => 
      cat.id === categoryId 
        ? {
            ...cat,
            links: cat.links.map((link: any) => 
              link.id === linkId ? { ...link, [field]: value } : link
            )
          }
        : cat
    ));
  };

  const deleteLink = (categoryId: string, linkId: string) => {
    setCategories(categories.map((cat: any) => 
      cat.id === categoryId 
        ? { ...cat, links: cat.links.filter((link: any) => link.id !== linkId) }
        : cat
    ));
  };

  const getDefaultWidgetTitle = (type: WidgetType): string => {
    const titles: Record<WidgetType, string> = {
      'category-links': 'Category Links',
      'quick-links': 'Quick Links',
      'text-block': 'Text Block',
      'weather': 'Weather',
      'clock': 'Clock',
      'stats': 'Statistics',
      'calendar': 'Calendar',
      'notes': 'Notes',
      'bookmarks': 'Bookmarks',
      'rss-feed': 'RSS Feed'
    };
    return titles[type];
  };

  const getDefaultWidgetConfig = (type: WidgetType) => {
    switch (type) {
      case 'category-links':
        return { categoryId: categories[0]?.id, showTitle: true };
      case 'quick-links':
        return { links: [] };
      case 'text-block':
        return { content: 'Enter your text here...' };
      case 'weather':
        return { location: '02889' };
      case 'clock':
        return {};
      default:
        return {};
    }
  };

  if (!currentLayout) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const colorOptions = [
    'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'cyan', 'orange', 'gray', 'black'
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Dashboard Editor</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditing ? '🔒 Exit Edit' : '✏️ Edit Layout'}
            </button>
            
            {isEditing && (
              <>
                <button
                  onClick={() => setShowWidgetPalette(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  ➕ Add Widget
                </button>

                <button
                  onClick={() => setShowLayoutManager(!showLayoutManager)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  🏗️ Manage Layout
                </button>
              </>
            )}

            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              📂 Manage Categories
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveDashboard}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            💾 Save All Changes
          </button>
        </div>
      </div>

      {/* Layout Manager */}
      {showLayoutManager && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Layout Management</h3>
            <div className="text-sm text-gray-400">
              Rows: {currentLayout.rows.length} • Total Widgets: {currentLayout.widgets.length}
            </div>
          </div>

          {/* Add New Row */}
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h4 className="text-white font-medium mb-3">Add New Row</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {LAYOUT_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => addRow(template.id)}
                  className="p-3 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors text-left"
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-300 mt-1">
                    {template.columns.map(col => col.width).join(' - ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Rows */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Existing Rows</h4>
            {currentLayout.rows.map((row, rowIndex) => {
              const rowWidgetCount = currentLayout.widgets.filter(w => w.position.row === rowIndex).length;
              
              return (
                <div key={row.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-white font-medium">Row {rowIndex + 1}</span>
                      <span className="ml-2 text-sm text-gray-400">
                        {row.columns.length} column{row.columns.length !== 1 ? 's' : ''} • {rowWidgetCount} widget{rowWidgetCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveRowUp(rowIndex)}
                        disabled={rowIndex === 0}
                        className="p-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded text-xs"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveRowDown(rowIndex)}
                        disabled={rowIndex >= currentLayout.rows.length - 1}
                        className="p-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white rounded text-xs"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Current Layout</label>
                      <div className="text-sm text-gray-400">
                        {row.columns.map(col => col.width).join(' - ')} (Total: {row.columns.reduce((sum, col) => sum + col.width, 0)}/12)
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Change Layout</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            updateRowLayout(rowIndex, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                      >
                        <option value="">Select new layout...</option>
                        {LAYOUT_TEMPLATES.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.columns.map(col => col.width).join(' - ')})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Manager */}
      {showCategoryManager && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Category Management</h3>
            <button
              onClick={addCategory}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              + Add Category
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {categories.map((category: any) => (
              <div key={category.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                  <input
                    type="text"
                    value={category.title}
                    onChange={(e) => updateCategory(category.id, 'title', e.target.value)}
                    className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    placeholder="Category Title"
                  />
                  <input
                    type="text"
                    value={category.emoji}
                    onChange={(e) => updateCategory(category.id, 'emoji', e.target.value)}
                    className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    placeholder="🔗"
                  />
                  <select
                    value={category.color}
                    onChange={(e) => updateCategory(category.id, 'color', e.target.value)}
                    className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  >
                    {colorOptions.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Links ({category.links.length})</span>
                    <button
                      onClick={() => addLink(category.id)}
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      + Add Link
                    </button>
                  </div>
                  
                  {category.links.map((link: any) => (
                    <div key={link.id} className="grid grid-cols-5 gap-2 bg-gray-600/30 p-2 rounded">
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateLink(category.id, link.id, 'title', e.target.value)}
                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                        placeholder="Title"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(category.id, link.id, 'url', e.target.value)}
                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs col-span-2"
                        placeholder="https://example.com"
                      />
                      <input
                        type="text"
                        value={link.emoji}
                        onChange={(e) => updateLink(category.id, link.id, 'emoji', e.target.value)}
                        className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                        placeholder="🔗"
                      />
                      <button
                        onClick={() => deleteLink(category.id, link.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <DashboardGrid
        layout={currentLayout}
        categories={categories}
        isEditing={isEditing}
        onEditWidget={handleEditWidget}
        onDeleteWidget={handleDeleteWidget}
      />

      {/* Widget Palette Modal */}
      {showWidgetPalette && (
        <WidgetPalette
          layout={currentLayout}
          onAddWidget={handleAddWidget}
          onClose={() => setShowWidgetPalette(false)}
        />
      )}

      {/* Widget Editor Modal */}
      {editingWidget && (
        <WidgetEditor
          widget={editingWidget}
          categories={categories}
          onSave={handleSaveWidget}
          onClose={() => setEditingWidget(null)}
        />
      )}
    </div>
  );
} 