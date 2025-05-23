'use client';

import React from 'react';
import BrandIcon from '../BrandIcon';
import { Widget } from '../../types/dashboard';

interface QuickLinksWidgetProps {
  widget: Widget;
  isEditing?: boolean;
}

export default function QuickLinksWidget({ widget, isEditing = false }: QuickLinksWidgetProps) {
  const links = widget.config.links || [];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-600/20 hover:bg-red-600/30 border-red-500/30',
      blue: 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30',
      green: 'bg-green-600/20 hover:bg-green-600/30 border-green-500/30',
      yellow: 'bg-yellow-600/20 hover:bg-yellow-600/30 border-yellow-500/30',
      purple: 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30',
      pink: 'bg-pink-600/20 hover:bg-pink-600/30 border-pink-500/30',
      indigo: 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/30',
      cyan: 'bg-cyan-600/20 hover:bg-cyan-600/30 border-cyan-500/30',
      orange: 'bg-orange-600/20 hover:bg-orange-600/30 border-orange-500/30',
      gray: 'bg-gray-600/20 hover:bg-gray-600/30 border-gray-500/30',
      black: 'bg-black/20 hover:bg-black/30 border-gray-500/30'
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div 
      className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 ${widget.config.showBorder ? 'border-2' : ''}`}
      style={{ 
        backgroundColor: widget.config.backgroundColor,
        color: widget.config.textColor
      }}
    >
      <h3 className="text-lg font-semibold mb-3 text-blue-400">
        🔗 {widget.title}
      </h3>
      
      {links.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No links configured</p>
          {isEditing && <p className="text-sm mt-1">Edit this widget to add links</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={isEditing ? '#' : link.url}
              className={`block p-3 rounded-lg transition-all duration-200 border ${getColorClasses(link.color)} ${isEditing ? 'cursor-default' : ''}`}
              target={isEditing ? undefined : "_blank"}
              rel={isEditing ? undefined : "noopener noreferrer"}
              onClick={isEditing ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex items-center space-x-3">
                <BrandIcon 
                  iconId={link.id} 
                  fallbackEmoji={link.icon}
                  size={18}
                  className="text-current"
                />
                <span className="text-sm">{link.title}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
} 