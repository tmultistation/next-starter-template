'use client';

import React from 'react';
import { DashboardLayout, Widget } from '../../types/dashboard';
import DashboardRow from './DashboardRow';

interface DashboardGridProps {
  layout: DashboardLayout;
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
  isEditing?: boolean;
  onLayoutChange?: (layout: DashboardLayout) => void;
  onEditWidget?: (widget: Widget) => void;
  onDeleteWidget?: (widgetId: string) => void;
}

export default function DashboardGrid({
  layout,
  categories,
  isEditing = false,
  onLayoutChange,
  onEditWidget,
  onDeleteWidget
}: DashboardGridProps) {

  const getWidgetsByRow = (rowIndex: number) => {
    return layout.widgets.filter(widget => widget.position.row === rowIndex);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{layout.name}</h2>
          <p className="text-gray-400">
            {layout.widgets.length} widget{layout.widgets.length !== 1 ? 's' : ''} • {layout.rows.length} row{layout.rows.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isEditing && (
          <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
            🏗️ Editing Mode
          </div>
        )}
      </div>

      {/* Dashboard Grid */}
      <div className="space-y-6">
        {layout.rows.map((row, rowIndex) => (
          <DashboardRow
            key={row.id}
            row={row}
            rowIndex={rowIndex}
            widgets={getWidgetsByRow(rowIndex)}
            categories={categories}
            isEditing={isEditing}
            onEditWidget={onEditWidget}
            onDeleteWidget={onDeleteWidget}
          />
        ))}
      </div>

      {/* Empty State */}
      {layout.widgets.length === 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-600">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Widgets Yet</h3>
          <p className="text-gray-400 mb-4">Start building your dashboard by adding widgets</p>
          {isEditing && (
            <p className="text-sm text-blue-400">Use the widget palette to add your first widget</p>
          )}
        </div>
      )}
    </div>
  );
} 