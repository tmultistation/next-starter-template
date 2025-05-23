'use client';

import React from 'react';
import { LayoutRow, Widget } from '../../types/dashboard';
import WidgetRenderer from '../widgets/WidgetRenderer';

interface DashboardRowProps {
  row: LayoutRow;
  rowIndex: number;
  widgets: Widget[];
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
  onEditWidget?: (widget: Widget) => void;
  onDeleteWidget?: (widgetId: string) => void;
}

export default function DashboardRow({
  row,
  rowIndex,
  widgets,
  categories,
  isEditing = false,
  onEditWidget,
  onDeleteWidget
}: DashboardRowProps) {
  
  const getWidgetsByColumn = (columnIndex: number) => {
    return widgets.filter(widget => widget.position.column === columnIndex);
  };

  const getColumnWidthClass = (width: number) => {
    const widthMap: Record<number, string> = {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      7: 'col-span-7',
      8: 'col-span-8',
      9: 'col-span-9',
      10: 'col-span-10',
      11: 'col-span-11',
      12: 'col-span-12',
    };
    return widthMap[width] || 'col-span-12';
  };

  return (
    <div 
      className="grid grid-cols-12 gap-4"
      style={{ minHeight: row.height ? `${row.height}px` : 'auto' }}
    >
      {row.columns.map((column, columnIndex) => {
        const columnWidgets = getWidgetsByColumn(columnIndex);
        
        return (
          <div 
            key={column.id}
            className={`${getColumnWidthClass(column.width)} space-y-4`}
          >
            {/* Column Drop Zone (shown when editing and empty) */}
            {isEditing && columnWidgets.length === 0 && (
              <div className="h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 bg-gray-800/20">
                <div className="text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-xs">Empty Column</p>
                  <p className="text-xs opacity-75">Row {rowIndex + 1}, Col {columnIndex + 1}</p>
                </div>
              </div>
            )}
            
            {/* Render widgets in this column */}
            {columnWidgets.map(widget => (
              <div key={widget.id} className="relative group">
                <WidgetRenderer
                  widget={widget}
                  categories={categories}
                  isEditing={isEditing}
                  onEdit={onEditWidget}
                  onDelete={onDeleteWidget}
                />
                
                {/* Enhanced Edit/Delete Controls */}
                {isEditing && (
                  <div className="absolute top-2 right-2 flex space-x-1 bg-gray-900/80 backdrop-blur rounded-lg p-1 border border-gray-600">
                    {onEditWidget && (
                      <button
                        onClick={() => onEditWidget(widget)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs transition-colors"
                        title="Edit Widget"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {onDeleteWidget && (
                      <button
                        onClick={() => onDeleteWidget(widget.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded text-white text-xs transition-colors"
                        title="Delete Widget"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
} 