'use client';

import React from 'react';
import { Widget } from '../../types/dashboard';

interface TextBlockWidgetProps {
  widget: Widget;
  isEditing?: boolean;
}

export default function TextBlockWidget({ widget, isEditing = false }: TextBlockWidgetProps) {
  const content = widget.config.content || '';

  return (
    <div 
      className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 ${widget.config.showBorder ? 'border-2' : ''}`}
      style={{ 
        backgroundColor: widget.config.backgroundColor,
        color: widget.config.textColor
      }}
    >
      <h3 className="text-lg font-semibold mb-3 text-purple-400">
        📝 {widget.title}
      </h3>
      
      {content ? (
        <div className="prose prose-invert max-w-none">
          <div 
            className="text-gray-300 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
          />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No content configured</p>
          {isEditing && <p className="text-sm mt-1">Edit this widget to add content</p>}
        </div>
      )}
    </div>
  );
} 