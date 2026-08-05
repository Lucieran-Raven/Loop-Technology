// ScreenAutoMonitor.ts - Continuous screen monitoring with smart triggers

import { EventEmitter } from 'events';
import { ScreenshotHelper } from './ScreenshotHelper';
import { LLMHelper } from './LLMHelper';

export interface ScreenCaptureConfig {
  enabled: boolean;
  intervalMs: number; // How often to capture screenshots
  triggerOnTextChange: boolean; // Capture when screen text changes significantly
  triggerOnWindowChange: boolean; // Capture when active window changes
  maxHistoryLength: number; // Maximum screenshots to keep
  analysisEnabled: boolean; // Whether to analyze captured screens
}

export interface ScreenCapture {
  path: string;
  timestamp: number;
  analysis?: string;
  textHash?: string; // For detecting text changes
  windowTitle?: string; // For detecting window changes
}

export class ScreenAutoMonitor extends EventEmitter {
  private config: ScreenCaptureConfig;
  private screenshotHelper: ScreenshotHelper;
  private llmHelper: LLMHelper;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private screenCaptures: ScreenCapture[] = [];
  private lastTextHash: string = '';
  private lastWindowTitle: string = '';

  constructor(
    screenshotHelper: ScreenshotHelper,
    llmHelper: LLMHelper,
    config: Partial<ScreenCaptureConfig> = {}
  ) {
    super();
    this.screenshotHelper = screenshotHelper;
    this.llmHelper = llmHelper;
    this.config = {
      enabled: false,
      intervalMs: 30000, // Default: capture every 30 seconds
      triggerOnTextChange: true,
      triggerOnWindowChange: true,
      maxHistoryLength: 20,
      analysisEnabled: true,
      ...config
    };
  }

  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('[ScreenAutoMonitor] Already monitoring');
      return;
    }

    this.isMonitoring = true;
    this.emit('monitoring-started');

    // Start periodic screen capture
    this.monitoringInterval = setInterval(() => {
      if (this.isMonitoring) {
        this.performScreenCapture();
      }
    }, this.config.intervalMs);

    console.log('[ScreenAutoMonitor] Started continuous screen monitoring');
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    this.emit('monitoring-stopped');
    console.log('[ScreenAutoMonitor] Stopped monitoring');
  }

  private async performScreenCapture(): Promise<void> {
    try {
      // Capture screenshot using ScreenshotHelper
      const screenshotPath = await this.screenshotHelper.takeScreenshot(
        () => {}, // No window hiding needed for background capture
        () => {}
      );

      const capture: ScreenCapture = {
        path: screenshotPath,
        timestamp: Date.now()
      };

      // Detect changes
      const textChanged = this.detectTextChange();
      const windowChanged = this.detectWindowChange();

      // Only process if triggers are met
      if (this.shouldCapture(textChanged, windowChanged)) {
        // Analyze if enabled
        if (this.config.analysisEnabled) {
          try {
            const analysis = await this.llmHelper.analyzeImageFile(screenshotPath);
            capture.analysis = analysis.text;
          } catch (error) {
            console.error('[ScreenAutoMonitor] Analysis failed:', error);
          }
        }

        this.screenCaptures.push(capture);
        
        // Trim history
        if (this.screenCaptures.length > this.config.maxHistoryLength) {
          this.screenCaptures = this.screenCaptures.slice(-this.config.maxHistoryLength);
        }

        this.emit('screen-captured', capture);
      }
    } catch (error) {
      console.error('[ScreenAutoMonitor] Screen capture failed:', error);
      this.emit('error', error);
    }
  }

  private detectTextChange(): boolean {
    // Simplified text change detection
    // In real implementation, this would use OCR to get screen text
    const currentHash = this.generateTextHash();
    const changed = currentHash !== this.lastTextHash;
    this.lastTextHash = currentHash;
    return changed;
  }

  private detectWindowChange(): boolean {
    // Simplified window change detection
    // In real implementation, this would get active window title
    const currentTitle = this.getCurrentWindowTitle();
    const changed = currentTitle !== this.lastWindowTitle;
    this.lastWindowTitle = currentTitle;
    return changed;
  }

  private generateTextHash(): string {
    // Placeholder for text hashing
    // In real implementation, this would extract text from screen and hash it
    return Date.now().toString();
  }

  private getCurrentWindowTitle(): string {
    // Placeholder for window title detection
    // In real implementation, this would use OS APIs to get active window
    return 'window'; // Placeholder
  }

  private shouldCapture(textChanged: boolean, windowChanged: boolean): boolean {
    if (this.config.triggerOnTextChange && textChanged) return true;
    if (this.config.triggerOnWindowChange && windowChanged) return true;
    return false; // Only capture on triggers if configured
  }

  public getScreenCaptures(): ScreenCapture[] {
    return [...this.screenCaptures];
  }

  public getRecentCaptures(count: number = 5): ScreenCapture[] {
    return this.screenCaptures.slice(-count);
  }

  public getScreenContext(): string {
    return this.screenCaptures
      .map(c => `[${new Date(c.timestamp).toLocaleTimeString()}]: ${c.analysis || 'No analysis'}`)
      .join('\n');
  }

  public clearHistory(): void {
    this.screenCaptures = [];
    this.emit('history-cleared');
  }

  public updateConfig(config: Partial<ScreenCaptureConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart monitoring if interval changed and currently monitoring
    if (config.intervalMs && this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  public getConfig(): ScreenCaptureConfig {
    return { ...this.config };
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }
}