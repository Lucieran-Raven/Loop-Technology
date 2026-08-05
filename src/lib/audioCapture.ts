// audioCapture.ts - Browser-side audio capture for renderer process

export interface AudioCaptureConfig {
  intervalMs: number;
  chunkDurationMs: number;
  enabled: boolean;
}

export class AudioCapture {
  private config: AudioCaptureConfig;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private captureInterval: ReturnType<typeof setInterval> | null = null;
  private isCapturing: boolean = false;
  private onChunkCallback: ((chunk: { data: string; mimeType: string; timestamp: number; duration: number }) => void) | null = null;

  constructor(config: Partial<AudioCaptureConfig> = {}) {
    this.config = {
      enabled: false,
      intervalMs: 5000,
      chunkDurationMs: 3000,
      ...config
    };
  }

  public async startCapture(
    onChunk: (chunk: { data: string; mimeType: string; timestamp: number; duration: number }) => void
  ): Promise<void> {
    if (this.isCapturing) {
      console.log('[AudioCapture] Already capturing');
      return;
    }

    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      this.onChunkCallback = onChunk;
      this.isCapturing = true;

      // Start periodic capture
      this.startPeriodicCapture();

      console.log('[AudioCapture] Started audio capture');
    } catch (error) {
      console.error('[AudioCapture] Failed to start capture:', error);
      throw error;
    }
  }

  public stopCapture(): void {
    if (!this.isCapturing) {
      return;
    }

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.isCapturing = false;
    this.onChunkCallback = null;
    console.log('[AudioCapture] Stopped capture');
  }

  private startPeriodicCapture(): void {
    this.captureInterval = setInterval(() => {
      if (this.isCapturing && this.mediaStream) {
        this.captureAudioChunk();
      }
    }, this.config.intervalMs);
  }

  private captureAudioChunk(): void {
    if (!this.mediaStream || !this.onChunkCallback) return;

    const chunks: Blob[] = [];
    const startTime = Date.now();

    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      
      // Skip if chunk is too small (likely silence)
      if (blob.size < 500) {
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        const audioChunk = {
          data: base64Data,
          mimeType: blob.type,
          timestamp: startTime,
          duration: Date.now() - startTime
        };

        if (this.onChunkCallback) {
          this.onChunkCallback(audioChunk);
        }
      };
      reader.readAsDataURL(blob);
    };

    this.mediaRecorder.start();

    // Stop after configured duration
    setTimeout(() => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    }, this.config.chunkDurationMs);
  }

  public updateConfig(config: Partial<AudioCaptureConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public isActive(): boolean {
    return this.isCapturing;
  }
}