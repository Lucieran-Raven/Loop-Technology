// MinimalMode.tsx - Compact UI component for minimal footprint mode

import React, { useState, useEffect } from 'react';

interface MinimalModeProps {
  isActive: boolean;
  onToggle: () => void;
  onQuickAction: (action: 'screenshot' | 'audio' | 'chat') => void;
  monitoringStatus: {
    audio: boolean;
    screen: boolean;
  };
}

const MinimalMode: React.FC<MinimalModeProps> = ({
  isActive,
  onToggle,
  onQuickAction,
  monitoringStatus
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!isActive) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-md rounded-lg shadow-2xl border border-white/10">
        {/* Compact Header */}
        {!expanded ? (
          <div className="flex items-center gap-2 p-2">
            {/* Status Indicators */}
            <div className="flex gap-1">
              <div 
                className={`w-2 h-2 rounded-full ${
                  monitoringStatus.audio ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`}
                title="Audio Monitoring"
              />
              <div 
                className={`w-2 h-2 rounded-full ${
                  monitoringStatus.screen ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
                }`}
                title="Screen Monitoring"
              />
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => onQuickAction('screenshot')}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Quick Screenshot"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={() => onQuickAction('audio')}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Quick Audio"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <button
              onClick={() => onQuickAction('chat')}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Quick Chat"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {/* Expand Toggle */}
            <button
              onClick={() => setExpanded(true)}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Expand"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

            {/* Exit Minimal Mode */}
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
              title="Exit Minimal Mode"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          /* Expanded Controls */
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white text-xs font-medium">Controls</span>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Monitoring Toggles */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs">Audio</span>
                <div className={`w-2 h-2 rounded-full ${monitoringStatus.audio ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-xs">Screen</span>
                <div className={`w-2 h-2 rounded-full ${monitoringStatus.screen ? 'bg-blue-500' : 'bg-gray-500'}`} />
              </div>
            </div>

            {/* Position Presets */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-white/70 text-xs block mb-1">Position</span>
              <div className="grid grid-cols-3 gap-1">
                {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => window.electronAPI.moveToPreset(preset)}
                    className="text-[10px] text-white/70 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
                  >
                    {preset.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Control */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-white/70 text-xs block mb-1">Opacity</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                defaultValue="0.9"
                onChange={(e) => window.electronAPI.setWindowOpacity(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalMode;