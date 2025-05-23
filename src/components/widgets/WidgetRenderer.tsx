'use client';

import React from 'react';
import { Widget } from '../../types/dashboard';
import CategoryLinksWidget from './CategoryLinksWidget';
import QuickLinksWidget from './QuickLinksWidget';
import TextBlockWidget from './TextBlockWidget';
import ClockWidget from './ClockWidget';
import WeatherWidget from './WeatherWidget';

interface WidgetRendererProps {
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
  isEditing?: boolean;
  onEdit?: (widget: Widget) => void;
  onDelete?: (widgetId: string) => void;
}

export default function WidgetRenderer({ 
  widget, 
  categories, 
  isEditing = false, 
  onEdit, 
  onDelete 
}: WidgetRendererProps) {
  
  const renderWidget = () => {
    switch (widget.type) {
      case 'category-links':
        return <CategoryLinksWidget widget={widget} categories={categories} isEditing={isEditing} />;
      
      case 'quick-links':
        return <QuickLinksWidget widget={widget} isEditing={isEditing} />;
      
      case 'text-block':
        return <TextBlockWidget widget={widget} isEditing={isEditing} />;
      
      case 'clock':
        return <ClockWidget widget={widget} isEditing={isEditing} />;
      
      case 'weather':
        return <WeatherWidget widget={widget} isEditing={isEditing} />;
      
      case 'stats':
        return <PlaceholderWidget widget={widget} icon="📊" message="Stats widget coming soon" />;
      
      case 'calendar':
        return <PlaceholderWidget widget={widget} icon="📅" message="Calendar widget coming soon" />;
      
      case 'notes':
        return <PlaceholderWidget widget={widget} icon="📋" message="Notes widget coming soon" />;
      
      case 'bookmarks':
        return <PlaceholderWidget widget={widget} icon="🔖" message="Bookmarks widget coming soon" />;
      
      case 'rss-feed':
        return <PlaceholderWidget widget={widget} icon="📡" message="RSS Feed widget coming soon" />;
      
      default:
        return <PlaceholderWidget widget={widget} icon="❓" message="Unknown widget type" />;
    }
  };

  return renderWidget();
}

// Placeholder component for widgets not yet implemented
function PlaceholderWidget({ 
  widget, 
  icon, 
  message 
}: { 
  widget: Widget; 
  icon: string; 
  message: string; 
}) {
  return (
    <div 
      className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 ${widget.config.showBorder ? 'border-2' : ''} min-h-[150px] flex flex-col items-center justify-center`}
      style={{ 
        backgroundColor: widget.config.backgroundColor,
        color: widget.config.textColor
      }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-400">{widget.title}</h3>
      <p className="text-sm text-gray-500 text-center">{message}</p>
    </div>
  );
} 