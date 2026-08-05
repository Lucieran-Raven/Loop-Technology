// electron/platformIntegration.ts
import { exec } from 'child_process';

export interface MeetingPlatform {
  name: 'zoom' | 'teams' | 'meet';
  isActive: () => Promise<boolean>;
  getMeetingId: () => Promise<string>;
  getParticipants: () => Promise<string[]>;
  isScreenSharing: () => Promise<boolean>;
}

export class ZoomIntegration implements MeetingPlatform {
  name = 'zoom' as const;
  
  async isActive(): Promise<boolean> {
    try {
      // Detect Zoom using process list
      const platform = process.platform;
      
      let command = '';
      if (platform === 'win32') {
        command = 'tasklist';
      } else if (platform === 'darwin') {
        command = 'ps aux';
      } else {
        command = 'ps aux';
      }
      
      return new Promise((resolve) => {
        exec(command, (error: any, stdout: string) => {
          if (error) {
            resolve(false);
            return;
          }
          const zoomRunning = stdout.toLowerCase().includes('zoom');
          resolve(zoomRunning);
        });
      });
    } catch (error) {
      console.error('Error detecting Zoom:', error);
      return false;
    }
  }
  
  async getMeetingId(): Promise<string> {
    // Placeholder - would need to parse Zoom window title
    return '';
  }
  
  async getParticipants(): Promise<string[]> {
    // Placeholder - would need accessibility API
    return [];
  }
  
  async isScreenSharing(): Promise<boolean> {
    // Placeholder - would need system-level detection
    return false;
  }
}

export class TeamsIntegration implements MeetingPlatform {
  name = 'teams' as const;
  
  async isActive(): Promise<boolean> {
    try {
      const platform = process.platform;
      
      let command = '';
      if (platform === 'win32') {
        command = 'tasklist';
      } else if (platform === 'darwin') {
        command = 'ps aux';
      } else {
        command = 'ps aux';
      }
      
      return new Promise((resolve) => {
        exec(command, (error: any, stdout: string) => {
          if (error) {
            resolve(false);
            return;
          }
          const teamsRunning = stdout.toLowerCase().includes('teams') || 
                                stdout.toLowerCase().includes('microsoft teams');
          resolve(teamsRunning);
        });
      });
    } catch (error) {
      console.error('Error detecting Teams:', error);
      return false;
    }
  }
  
  async getMeetingId(): Promise<string> {
    return '';
  }
  
  async getParticipants(): Promise<string[]> {
    return [];
  }
  
  async isScreenSharing(): Promise<boolean> {
    return false;
  }
}

export class MeetIntegration implements MeetingPlatform {
  name = 'meet' as const;
  
  async isActive(): Promise<boolean> {
    // Google Meet typically runs in browser, harder to detect
    // This is a placeholder implementation
    return false;
  }
  
  async getMeetingId(): Promise<string> {
    return '';
  }
  
  async getParticipants(): Promise<string[]> {
    return [];
  }
  
  async isScreenSharing(): Promise<boolean> {
    return false;
  }
}

export class PlatformManager {
  private platforms: MeetingPlatform[] = [
    new ZoomIntegration(),
    new TeamsIntegration(),
    new MeetIntegration()
  ];

  async getActivePlatform(): Promise<MeetingPlatform | null> {
    for (const platform of this.platforms) {
      if (await platform.isActive()) {
        return platform;
      }
    }
    return null;
  }

  async getAllPlatformsStatus(): Promise<Array<{ name: string; active: boolean }>> {
    const statuses = await Promise.all(
      this.platforms.map(async (platform) => ({
        name: platform.name,
        active: await platform.isActive()
      }))
    );
    return statuses;
  }

  getPlatformByName(name: 'zoom' | 'teams' | 'meet'): MeetingPlatform | null {
    return this.platforms.find(p => p.name === name) || null;
  }
}