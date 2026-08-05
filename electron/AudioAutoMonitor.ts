// AudioAutoMonitor.ts - Continuous audio monitoring coordinator

import { EventEmitter } from 'events';

export interface AudioChunk {
  data: string; // base64 encoded audio data
  mimeType: string;
  timestamp: number;
  duration: number;
}

export interface TranscriptionResult {
  text: string;
  timestamp: number;
  confidence?: number;
}

export interface AudioMonitorConfig {
  enabled: boolean;
  intervalMs: number; // How often to capture audio chunks
  chunkDurationMs: number; // Duration of each audio chunk
  maxHistoryLength: number; // Maximum number of transcriptions to keep
}

export class AudioAutoMonitor extends EventEmitter {
  private config: AudioMonitorConfig;
  private isMonitoring: boolean = false;
  private audioChunks: AudioChunk[] = [];
  private transcriptions: TranscriptionResult[] = [];

  constructor(config: Partial<AudioMonitorConfig> = {}) {
    super();
    this.config = {
      enabled: false,
      intervalMs: 5000, // Default: capture every 5 seconds
      chunkDurationMs: 3000, // Default: 3-second chunks
      maxHistoryLength: 50, // Keep last 50 transcriptions
      ...config
    };
  }

  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('[AudioAutoMonitor] Already monitoring');
      return;
    }

    this.isMonitoring = true;
    this.emit('monitoring-started');
    console.log('[AudioAutoMonitor] Started continuous audio monitoring');
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    this.emit('monitoring-stopped');
    console.log('[AudioAutoMonitor] Stopped monitoring');
  }

  // Called from renderer process when audio chunk is captured
  public addAudioChunk(chunk: AudioChunk): void {
    if (!this.isMonitoring) return;
    
    this.audioChunks.push(chunk);
    this.emit('audio-chunk', chunk);
    this.emit('transcribe-request', chunk);
  }

  public addTranscription(result: TranscriptionResult): void {
    this.transcriptions.push(result);
    
    // Trim history if too long
    if (this.transcriptions.length > this.config.maxHistoryLength) {
      this.transcriptions = this.transcriptions.slice(-this.config.maxHistoryLength);
    }

    this.emit('transcription-added', result);
  }

  public getTranscriptions(): TranscriptionResult[] {
    return [...this.transcriptions];
  }

  public getRecentTranscriptions(count: number = 5): TranscriptionResult[] {
    return this.transcriptions.slice(-count);
  }

  public getFullContext(): string {
    return this.transcriptions
      .map(t => `[${new Date(t.timestamp).toLocaleTimeString()}]: ${t.text}`)
      .join('\n');
  }

  public clearHistory(): void {
    this.transcriptions = [];
    this.audioChunks = [];
    this.emit('history-cleared');
  }

  public updateConfig(config: Partial<AudioMonitorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): AudioMonitorConfig {
    return { ...this.config };
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }

  public getAudioChunks(): AudioChunk[] {
    return [...this.audioChunks];
  }
}