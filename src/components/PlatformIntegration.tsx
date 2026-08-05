// src/components/PlatformIntegration.tsx
import React, { useState, useEffect } from 'react';
import { Video, Users, Monitor, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface PlatformStatus {
  name: string;
  active: boolean;
}

interface PlatformInfo {
  name: string;
  isActive: boolean;
  meetingId: string;
  participants: string[];
  isScreenSharing: boolean;
}

const PlatformIntegration: React.FC = () => {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'zoom' | 'teams' | 'meet' | null>(null);
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadPlatformStatus();
    checkActivePlatform();
  }, []);

  const loadPlatformStatus = async () => {
    try {
      const result = await window.electronAPI.getAllPlatformsStatus();
      if (result.success) {
        setPlatforms(result.statuses || []);
      }
    } catch (error) {
      console.error('Error loading platform status:', error);
    }
  };

  const checkActivePlatform = async () => {
    try {
      const result = await window.electronAPI.getActivePlatform();
      if (result.success) {
        setActivePlatform(result.platform || null);
      }
    } catch (error) {
      console.error('Error checking active platform:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadPlatformStatus(), checkActivePlatform()]);
    setIsRefreshing(false);
  };

  const handleSelectPlatform = async (platformName: 'zoom' | 'teams' | 'meet') => {
    setSelectedPlatform(platformName);
    try {
      const result = await window.electronAPI.getPlatformInfo(platformName);
      if (result.success) {
        setPlatformInfo(result.info);
      }
    } catch (error) {
      console.error('Error getting platform info:', error);
    }
  };

  const getPlatformIcon = (name: string) => {
    switch (name) {
      case 'zoom':
        return '🎥';
      case 'teams':
        return '👥';
      case 'meet':
        return '🔵';
      default:
        return '📹';
    }
  };

  const getPlatformDisplayName = (name: string) => {
    switch (name) {
      case 'zoom':
        return 'Zoom';
      case 'teams':
        return 'Microsoft Teams';
      case 'meet':
        return 'Google Meet';
      default:
        return name;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Platform Integration</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Refresh status"
        >
          <RefreshCw size={16} className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="text-white font-medium">Detected Platforms</h3>
        <div className="grid grid-cols-1 gap-2">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                selectedPlatform === platform.name
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => handleSelectPlatform(platform.name as 'zoom' | 'teams' | 'meet')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPlatformIcon(platform.name)}</span>
                  <div>
                    <h4 className="text-white font-medium">{getPlatformDisplayName(platform.name)}</h4>
                    <div className="flex items-center gap-1 text-xs">
                      {platform.active ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <XCircle size={12} />
                          Not detected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {platform.active && activePlatform === platform.name && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {platformInfo && (
        <div className="space-y-3">
          <h3 className="text-white font-medium">Platform Details</h3>
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Platform</span>
              <span className="text-white font-medium">{getPlatformDisplayName(platformInfo.name)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Status</span>
              <span className={platformInfo.isActive ? 'text-green-400' : 'text-gray-400'}>
                {platformInfo.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {platformInfo.meetingId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Meeting ID</span>
                <span className="text-white font-mono text-sm">{platformInfo.meetingId}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Users size={14} />
                Participants
              </span>
              <span className="text-white">{platformInfo.participants.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Monitor size={14} />
                Screen Sharing
              </span>
              <span className={platformInfo.isScreenSharing ? 'text-green-400' : 'text-gray-400'}>
                {platformInfo.isScreenSharing ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 text-center">
        Platform integration is currently in beta. Detection may not be accurate on all systems.
      </div>
    </div>
  );
};

export default PlatformIntegration;