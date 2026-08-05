// AdvancedSettings.tsx - Comprehensive settings UI for new features

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './dialog';

interface AdvancedSettingsProps {
  trigger: React.ReactNode;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Audio monitoring settings
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioInterval, setAudioInterval] = useState(5);
  const [audioChunkDuration, setAudioChunkDuration] = useState(3);
  
  // Screen monitoring settings
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [screenInterval, setScreenInterval] = useState(30);
  const [triggerOnTextChange, setTriggerOnTextChange] = useState(true);
  const [triggerOnWindowChange, setTriggerOnWindowChange] = useState(true);
  
  // Context settings
  const [contextWindow, setContextWindow] = useState(30);
  const [maxHistoryLength, setMaxHistoryLength] = useState(100);
  
  // Window settings
  const [windowOpacity, setWindowOpacity] = useState(0.9);
  const [minimalMode, setMinimalMode] = useState(false);
  
  // Status monitoring
  const [status, setStatus] = useState({
    audioActive: false,
    screenActive: false,
    contextStats: null as any
  });

  const loadStatus = async () => {
    try {
      const audioActive = await window.electronAPI.isAudioMonitoringActive();
      const screenActive = await window.electronAPI.isScreenMonitoringActive();
      const contextStats = await window.electronAPI.getContextStatistics();
      
      setStatus({
        audioActive,
        screenActive,
        contextStats
      });
    } catch (error) {
      console.error('Error loading status:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadStatus();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const audioConfig = await window.electronAPI.getAudioConfig();
      if (audioConfig) {
        setAudioEnabled(audioConfig.enabled);
        setAudioInterval(audioConfig.intervalMs / 1000);
        setAudioChunkDuration(audioConfig.chunkDurationMs / 1000);
      }

      const screenConfig = await window.electronAPI.getScreenConfig();
      if (screenConfig) {
        setScreenEnabled(screenConfig.enabled);
        setScreenInterval(screenConfig.intervalMs / 1000);
        setTriggerOnTextChange(screenConfig.triggerOnTextChange);
        setTriggerOnWindowChange(screenConfig.triggerOnWindowChange);
      }

      const currentOpacity = await window.electronAPI.getWindowOpacity();
      setWindowOpacity(currentOpacity);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveAudioSettings = async () => {
    try {
      await window.electronAPI.updateAudioConfig({
        enabled: audioEnabled,
        intervalMs: audioInterval * 1000,
        chunkDurationMs: audioChunkDuration * 1000
      });
      
      if (audioEnabled && !status.audioActive) {
        await window.electronAPI.startAudioMonitoring();
      } else if (!audioEnabled && status.audioActive) {
        await window.electronAPI.stopAudioMonitoring();
      }
      
      loadStatus();
    } catch (error) {
      console.error('Error saving audio settings:', error);
    }
  };

  const saveScreenSettings = async () => {
    try {
      await window.electronAPI.updateScreenConfig({
        enabled: screenEnabled,
        intervalMs: screenInterval * 1000,
        triggerOnTextChange,
        triggerOnWindowChange
      });
      
      if (screenEnabled && !status.screenActive) {
        await window.electronAPI.startScreenMonitoring();
      } else if (!screenEnabled && status.screenActive) {
        await window.electronAPI.stopScreenMonitoring();
      }
      
      loadStatus();
    } catch (error) {
      console.error('Error saving screen settings:', error);
    }
  };

  const saveWindowSettings = async () => {
    try {
      await window.electronAPI.setWindowOpacity(windowOpacity);
    } catch (error) {
      console.error('Error saving window settings:', error);
    }
  };

  const clearContextHistory = async () => {
    try {
      await window.electronAPI.clearContextHistory();
      loadStatus();
    } catch (error) {
      console.error('Error clearing context history:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Advanced Settings</h2>
        </div>
        
        <div className="space-y-6 mt-4">
          {/* Audio Monitoring Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Audio Monitoring</h3>
              <div className={`w-2 h-2 rounded-full ${status.audioActive ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>
            
            <div className="space-y-3 pl-4 border-l-2 border-gray-700">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Enable Continuous Audio</label>
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    audioEnabled ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    audioEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 block mb-1">
                  Capture Interval: {audioInterval}s
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={audioInterval}
                  onChange={(e) => setAudioInterval(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-300 block mb-1">
                  Chunk Duration: {audioChunkDuration}s
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={audioChunkDuration}
                  onChange={(e) => setAudioChunkDuration(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <button
                onClick={saveAudioSettings}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm transition-colors"
              >
                Apply Audio Settings
              </button>
            </div>
          </div>

          {/* Screen Monitoring Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Screen Monitoring</h3>
              <div className={`w-2 h-2 rounded-full ${status.screenActive ? 'bg-blue-500' : 'bg-gray-500'}`} />
            </div>
            
            <div className="space-y-3 pl-4 border-l-2 border-gray-700">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Enable Continuous Screen</label>
                <button
                  onClick={() => setScreenEnabled(!screenEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    screenEnabled ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    screenEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div>
                <label className="text-sm text-gray-300 block mb-1">
                  Capture Interval: {screenInterval}s
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={screenInterval}
                  onChange={(e) => setScreenInterval(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Trigger on Text Change</label>
                <button
                  onClick={() => setTriggerOnTextChange(!triggerOnTextChange)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    triggerOnTextChange ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    triggerOnTextChange ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Trigger on Window Change</label>
                <button
                  onClick={() => setTriggerOnWindowChange(!triggerOnWindowChange)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    triggerOnWindowChange ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    triggerOnWindowChange ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <button
                onClick={saveScreenSettings}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm transition-colors"
              >
                Apply Screen Settings
              </button>
            </div>
          </div>

          {/* Context Management Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Context Management</h3>
            
            <div className="space-y-3 pl-4 border-l-2 border-gray-700">
              {status.contextStats && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-800 p-2 rounded">
                    <div className="text-gray-400">Total</div>
                    <div className="font-semibold">{status.contextStats.total}</div>
                  </div>
                  <div className="bg-gray-800 p-2 rounded">
                    <div className="text-gray-400">Audio</div>
                    <div className="font-semibold">{status.contextStats.audio}</div>
                  </div>
                  <div className="bg-gray-800 p-2 rounded">
                    <div className="text-gray-400">Screen</div>
                    <div className="font-semibold">{status.contextStats.screen}</div>
                  </div>
                  <div className="bg-gray-800 p-2 rounded">
                    <div className="text-gray-400">Chat</div>
                    <div className="font-semibold">{status.contextStats.chat}</div>
                  </div>
                </div>
              )}
              
              <button
                onClick={clearContextHistory}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm transition-colors"
              >
                Clear Context History
              </button>
            </div>
          </div>

          {/* Window Settings Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Window Settings</h3>
            
            <div className="space-y-3 pl-4 border-l-2 border-gray-700">
              <div>
                <label className="text-sm text-gray-300 block mb-1">
                  Opacity: {Math.round(windowOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={windowOpacity}
                  onChange={(e) => setWindowOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => window.electronAPI.moveToPreset(preset)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                  >
                    {preset.replace('-', ' ')}
                  </button>
                ))}
              </div>
              
              <button
                onClick={saveWindowSettings}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm transition-colors"
              >
                Apply Window Settings
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSettings;