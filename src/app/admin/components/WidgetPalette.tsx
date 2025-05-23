'use client';

import React, { useState } from 'react';
import { DashboardLayout, WidgetType } from '../../../types/dashboard';

interface WidgetPaletteProps {
  layout: DashboardLayout;
  onAddWidget: (type: WidgetType, rowIndex: number, columnIndex: number) => void;
  onClose: () => void;
}

interface WidgetTypeInfo {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const widgetTypes: WidgetTypeInfo[] = [
  {
    type: 'category-links',
    name: 'Category Links',
    description: 'Display links from a specific category',
    icon: '📂',
    color: 'bg-blue-600'
  },
  {
    type: 'quick-links',
    name: 'Quick Links',
    description: 'Custom collection of links',
    icon: '🔗',
    color: 'bg-green-600'
  },
  {
    type: 'text-block',
    name: 'Text Block',
    description: 'Add custom text content',
    icon: '📝',
    color: 'bg-purple-600'
  },
  {
    type: 'clock',
    name: 'Clock',
    description: 'Display current time and date',
    icon: '🕐',
    color: 'bg-yellow-600'
  },
  {
    type: 'weather',
    name: 'Weather',
    description: 'Live weather data from Tomorrow.io API',
    icon: '🌤️',
    color: 'bg-cyan-600'
  },
  {
    type: 'stats',
    name: 'Statistics',
    description: 'Display metrics and stats (coming soon)',
    icon: '📊',
    color: 'bg-red-600'
  },
  {
    type: 'calendar',
    name: 'Calendar',
    description: 'Calendar widget (coming soon)',
    icon: '📅',
    color: 'bg-indigo-600'
  },
  {
    type: 'notes',
    name: 'Notes',
    description: 'Quick notes widget (coming soon)',
    icon: '📋',
    color: 'bg-orange-600'
  }
];

export default function WidgetPalette({ layout, onAddWidget, onClose }: WidgetPaletteProps) {
  const [selectedWidget, setSelectedWidget] = useState<WidgetType | null>(null);
  const [step, setStep] = useState<'select' | 'place'>('select');

  const handleWidgetSelect = (type: WidgetType) => {
    setSelectedWidget(type);
    setStep('place');
  };

  const handlePlacement = (rowIndex: number, columnIndex: number) => {
    if (selectedWidget) {
      onAddWidget(selectedWidget, rowIndex, columnIndex);
      onClose();
    }
  };

  const getSelectedWidgetInfo = () => {
    return widgetTypes.find(w => w.type === selectedWidget);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {step === 'select' ? 'Choose a Widget' : 'Choose Placement'}
            </h3>
            <p className="text-gray-400 text-sm">
              {step === 'select' 
                ? 'Select the type of widget you want to add'
                : 'Click on a column to place your widget'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgetTypes.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() => handleWidgetSelect(widget.type)}
                  className="p-4 border border-gray-600 rounded-lg hover:border-gray-500 transition-all group text-left bg-gray-700/50 hover:bg-gray-700"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${widget.color} rounded-lg flex items-center justify-center text-white text-lg shrink-0`}>
                      {widget.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                        {widget.name}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'place' && selectedWidget && (
            <div className="space-y-6">
              {/* Selected Widget Info */}
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${getSelectedWidgetInfo()?.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                    {getSelectedWidgetInfo()?.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{getSelectedWidgetInfo()?.name}</h4>
                    <p className="text-gray-400 text-sm">{getSelectedWidgetInfo()?.description}</p>
                  </div>
                  <button
                    onClick={() => setStep('select')}
                    className="ml-auto text-blue-400 hover:text-blue-300 text-sm"
                  >
                    ← Change Widget
                  </button>
                </div>
              </div>

              {/* Layout Grid for Placement */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Click on a column to place your widget:</h4>
                {layout.rows.map((row, rowIndex) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2">
                    {row.columns.map((column, columnIndex) => {
                      const columnWidths = {
                        1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
                        5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
                        9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12'
                      };
                      
                      return (
                        <button
                          key={column.id}
                          onClick={() => handlePlacement(rowIndex, columnIndex)}
                          className={`${columnWidths[column.width as keyof typeof columnWidths]} h-16 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-400/10 transition-all flex items-center justify-center text-gray-400 hover:text-blue-400`}
                        >
                          <div className="text-center">
                            <div className="text-sm">Row {rowIndex + 1}</div>
                            <div className="text-xs">Col {columnIndex + 1}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 