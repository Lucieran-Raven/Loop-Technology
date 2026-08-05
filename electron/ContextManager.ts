// ContextManager.ts - Enhanced conversation memory and multi-modal context tracking

import { EventEmitter } from 'events';

export interface ContextEntry {
  type: 'audio' | 'screen' | 'chat' | 'manual';
  content: string;
  timestamp: number;
  metadata?: {
    analysis?: string;
    screenshotPath?: string;
    transcription?: string;
    windowTitle?: string;
  };
}

export interface ContextConfig {
  maxHistoryLength: number;
  maxAudioEntries: number;
  maxScreenEntries: number;
  maxChatEntries: number;
  contextWindowMs: number; // How long to keep context (in milliseconds)
}

export class ContextManager extends EventEmitter {
  private config: ContextConfig;
  private contextHistory: ContextEntry[] = [];

  constructor(config: Partial<ContextConfig> = {}) {
    super();
    this.config = {
      maxHistoryLength: 100,
      maxAudioEntries: 30,
      maxScreenEntries: 30,
      maxChatEntries: 40,
      contextWindowMs: 30 * 60 * 1000, // 30 minutes default
      ...config
    };
  }

  public addAudioContext(content: string, metadata?: any): void {
    const entry: ContextEntry = {
      type: 'audio',
      content,
      timestamp: Date.now(),
      metadata: {
        transcription: content,
        ...metadata
      }
    };

    this.addEntry(entry);
    this.emit('audio-context-added', entry);
  }

  public addScreenContext(content: string, metadata?: any): void {
    const entry: ContextEntry = {
      type: 'screen',
      content,
      timestamp: Date.now(),
      metadata: {
        analysis: content,
        ...metadata
      }
    };

    this.addEntry(entry);
    this.emit('screen-context-added', entry);
  }

  public addChatContext(content: string, metadata?: any): void {
    const entry: ContextEntry = {
      type: 'chat',
      content,
      timestamp: Date.now(),
      metadata
    };

    this.addEntry(entry);
    this.emit('chat-context-added', entry);
  }

  public addManualContext(content: string, metadata?: any): void {
    const entry: ContextEntry = {
      type: 'manual',
      content,
      timestamp: Date.now(),
      metadata
    };

    this.addEntry(entry);
    this.emit('manual-context-added', entry);
  }

  private addEntry(entry: ContextEntry): void {
    this.contextHistory.push(entry);
    this.trimHistory();
    this.emit('context-added', entry);
  }

  private trimHistory(): void {
    const now = Date.now();

    // Remove entries outside time window
    this.contextHistory = this.contextHistory.filter(
      entry => now - entry.timestamp <= this.config.contextWindowMs
    );

    // Trim by type limits
    const audioCount = this.contextHistory.filter(e => e.type === 'audio').length;
    const screenCount = this.contextHistory.filter(e => e.type === 'screen').length;
    const chatCount = this.contextHistory.filter(e => e.type === 'chat').length;

    if (audioCount > this.config.maxAudioEntries) {
      this.trimByType('audio', this.config.maxAudioEntries);
    }
    if (screenCount > this.config.maxScreenEntries) {
      this.trimByType('screen', this.config.maxScreenEntries);
    }
    if (chatCount > this.config.maxChatEntries) {
      this.trimByType('chat', this.config.maxChatEntries);
    }

    // Trim total history
    if (this.contextHistory.length > this.config.maxHistoryLength) {
      this.contextHistory = this.contextHistory.slice(-this.config.maxHistoryLength);
    }
  }

  private trimByType(type: ContextEntry['type'], maxCount: number): void {
    const typeEntries = this.contextHistory.filter(e => e.type === type);
    if (typeEntries.length > maxCount) {
      const toRemove = typeEntries.length - maxCount;
      const removeTimestamps = typeEntries.slice(0, toRemove).map(e => e.timestamp);
      this.contextHistory = this.contextHistory.filter(
        e => !removeTimestamps.includes(e.timestamp)
      );
    }
  }

  public getRecentContext(count: number = 10): ContextEntry[] {
    return this.contextHistory.slice(-count);
  }

  public getAudioContext(): string {
    const audioEntries = this.contextHistory.filter(e => e.type === 'audio');
    return audioEntries
      .map(e => `[${new Date(e.timestamp).toLocaleTimeString()}]: ${e.content}`)
      .join('\n');
  }

  public getScreenContext(): string {
    const screenEntries = this.contextHistory.filter(e => e.type === 'screen');
    return screenEntries
      .map(e => `[${new Date(e.timestamp).toLocaleTimeString()}]: ${e.content}`)
      .join('\n');
  }

  public getChatContext(): string {
    const chatEntries = this.contextHistory.filter(e => e.type === 'chat');
    return chatEntries
      .map(e => `[${new Date(e.timestamp).toLocaleTimeString()}]: ${e.content}`)
      .join('\n');
  }

  public getFullContext(): string {
    return this.contextHistory
      .map(e => {
        const time = new Date(e.timestamp).toLocaleTimeString();
        const type = e.type.toUpperCase();
        return `[${time}][${type}]: ${e.content}`;
      })
      .join('\n');
  }

  public getFormattedContextForAI(): string {
    const recentContext = this.getRecentContext(15);
    
    let formatted = "Recent Context:\n";
    
    // Group by type for better readability
    const audioContext = recentContext.filter(e => e.type === 'audio');
    const screenContext = recentContext.filter(e => e.type === 'screen');
    const chatContext = recentContext.filter(e => e.type === 'chat');

    if (audioContext.length > 0) {
      formatted += "\nAudio Transcriptions:\n";
      audioContext.forEach(e => {
        formatted += `- ${new Date(e.timestamp).toLocaleTimeString()}: ${e.content}\n`;
      });
    }

    if (screenContext.length > 0) {
      formatted += "\nScreen Analysis:\n";
      screenContext.forEach(e => {
        formatted += `- ${new Date(e.timestamp).toLocaleTimeString()}: ${e.content}\n`;
      });
    }

    if (chatContext.length > 0) {
      formatted += "\nChat Messages:\n";
      chatContext.forEach(e => {
        formatted += `- ${new Date(e.timestamp).toLocaleTimeString()}: ${e.content}\n`;
      });
    }

    return formatted;
  }

  public searchContext(query: string): ContextEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.contextHistory.filter(entry =>
      entry.content.toLowerCase().includes(lowerQuery) ||
      (entry.metadata?.analysis && entry.metadata.analysis.toLowerCase().includes(lowerQuery))
    );
  }

  public getContextByType(type: ContextEntry['type']): ContextEntry[] {
    return this.contextHistory.filter(e => e.type === type);
  }

  public getContextInTimeRange(startTime: number, endTime: number): ContextEntry[] {
    return this.contextHistory.filter(
      entry => entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  public clearHistory(): void {
    this.contextHistory = [];
    this.emit('history-cleared');
  }

  public clearType(type: ContextEntry['type']): void {
    this.contextHistory = this.contextHistory.filter(e => e.type !== type);
    this.emit('type-cleared', type);
  }

  public clearOldContext(maxAgeMs: number): void {
    const now = Date.now();
    const beforeCount = this.contextHistory.length;
    this.contextHistory = this.contextHistory.filter(
      entry => now - entry.timestamp <= maxAgeMs
    );
    const clearedCount = beforeCount - this.contextHistory.length;
    if (clearedCount > 0) {
      this.emit('old-context-cleared', clearedCount);
    }
  }

  public updateConfig(config: Partial<ContextConfig>): void {
    this.config = { ...this.config, ...config };
    this.trimHistory(); // Re-trim with new config
  }

  public getConfig(): ContextConfig {
    return { ...this.config };
  }

  public getHistoryLength(): number {
    return this.contextHistory.length;
  }

  public getStatistics(): {
    total: number;
    audio: number;
    screen: number;
    chat: number;
    manual: number;
  } {
    return {
      total: this.contextHistory.length,
      audio: this.contextHistory.filter(e => e.type === 'audio').length,
      screen: this.contextHistory.filter(e => e.type === 'screen').length,
      chat: this.contextHistory.filter(e => e.type === 'chat').length,
      manual: this.contextHistory.filter(e => e.type === 'manual').length
    };
  }
}