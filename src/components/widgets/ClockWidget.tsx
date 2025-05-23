'use client';

import React, { useState, useEffect } from 'react';
import { Widget } from '../../types/dashboard';

interface ClockWidgetProps {
  widget: Widget;
  isEditing?: boolean;
}

export default function ClockWidget({ widget, isEditing = false }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (isEditing) return; // Don't update time in editing mode
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isEditing]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={`p-4 bg-gray-800/50 rounded-lg border border-gray-700 ${widget.config.showBorder ? 'border-2' : ''}`}
      style={{ 
        backgroundColor: widget.config.backgroundColor,
        color: widget.config.textColor
      }}
    >
      <h3 className="text-lg font-semibold mb-3 text-green-400">
        🕐 {widget.title}
      </h3>
      
      <div className="text-center">
        <div className="text-3xl font-mono font-bold text-white mb-2">
          {formatTime(time)}
        </div>
        <div className="text-sm text-gray-400">
          {formatDate(time)}
        </div>
      </div>
    </div>
  );
} 