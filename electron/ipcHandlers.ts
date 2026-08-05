// ipcHandlers.ts

import { ipcMain, app } from "electron"
import { AppState } from "./main"

export function initializeIpcHandlers(appState: AppState): void {
  ipcMain.handle(
    "update-content-dimensions",
    async (event, { width, height }: { width: number; height: number }) => {
      if (width && height) {
        appState.setWindowDimensions(width, height)
      }
    }
  )

  ipcMain.handle("delete-screenshot", async (event, path: string) => {
    return appState.deleteScreenshot(path)
  })

  ipcMain.handle("take-screenshot", async () => {
    try {
      const screenshotPath = await appState.takeScreenshot()
      const preview = await appState.getImagePreview(screenshotPath)
      return { path: screenshotPath, preview }
    } catch (error) {
      console.error("Error taking screenshot:", error)
      throw error
    }
  })

  ipcMain.handle("get-screenshots", async () => {
    console.log({ view: appState.getView() })
    try {
      let previews = []
      if (appState.getView() === "queue") {
        previews = await Promise.all(
          appState.getScreenshotQueue().map(async (path) => ({
            path,
            preview: await appState.getImagePreview(path)
          }))
        )
      } else {
        previews = await Promise.all(
          appState.getExtraScreenshotQueue().map(async (path) => ({
            path,
            preview: await appState.getImagePreview(path)
          }))
        )
      }
      previews.forEach((preview: any) => console.log(preview.path))
      return previews
    } catch (error) {
      console.error("Error getting screenshots:", error)
      throw error
    }
  })

  ipcMain.handle("toggle-window", async () => {
    appState.toggleMainWindow()
  })

  ipcMain.handle("reset-queues", async () => {
    try {
      appState.clearQueues()
      console.log("Screenshot queues have been cleared.")
      return { success: true }
    } catch (error: any) {
      console.error("Error resetting queues:", error)
      return { success: false, error: error.message }
    }
  })

  // IPC handler for analyzing audio from base64 data
  ipcMain.handle("analyze-audio-base64", async (event, data: string, mimeType: string, conversationContext: string = "") => {
    try {
      const result = await appState.processingHelper.processAudioBase64(data, mimeType, conversationContext)
      return result
    } catch (error: any) {
      console.error("Error in analyze-audio-base64 handler:", error)
      throw error
    }
  })

  // IPC handler for analyzing audio from file path
  ipcMain.handle("analyze-audio-file", async (event, path: string) => {
    try {
      const result = await appState.processingHelper.processAudioFile(path)
      return result
    } catch (error: any) {
      console.error("Error in analyze-audio-file handler:", error)
      throw error
    }
  })

  // IPC handler for analyzing image from file path
  ipcMain.handle("analyze-image-file", async (event, path: string, audioContext: string = "") => {
    try {
      const result = await appState.processingHelper.getLLMHelper().analyzeImageFile(path, audioContext)
      return result
    } catch (error: any) {
      console.error("Error in analyze-image-file handler:", error)
      throw error
    }
  })

  ipcMain.handle("gemini-chat", async (event, message: string, audioContext: string = "") => {
    try {
      const result = await appState.processingHelper.getLLMHelper().chatWithGemini(message, audioContext);
      return result;
    } catch (error: any) {
      console.error("Error in gemini-chat handler:", error);
      throw error;
    }
  });

  ipcMain.handle("quit-app", () => {
    app.quit()
  })

  // Window movement handlers
  ipcMain.handle("move-window-left", async () => {
    appState.moveWindowLeft()
  })

  ipcMain.handle("move-window-right", async () => {
    appState.moveWindowRight()
  })

  ipcMain.handle("move-window-up", async () => {
    appState.moveWindowUp()
  })

  ipcMain.handle("move-window-down", async () => {
    appState.moveWindowDown()
  })

  ipcMain.handle("center-and-show-window", async () => {
    appState.centerAndShowWindow()
  })

  // LLM Model Management Handlers
  ipcMain.handle("get-current-llm-config", async () => {
    try {
      const llmHelper = appState.processingHelper.getLLMHelper();
      return {
        provider: llmHelper.getCurrentProvider(),
        model: llmHelper.getCurrentModel(),
        isOllama: llmHelper.isUsingOllama()
      };
    } catch (error: any) {
      console.error("Error getting current LLM config:", error);
      throw error;
    }
  });

  ipcMain.handle("get-available-ollama-models", async () => {
    try {
      const llmHelper = appState.processingHelper.getLLMHelper();
      const models = await llmHelper.getOllamaModels();
      return models;
    } catch (error: any) {
      console.error("Error getting Ollama models:", error);
      throw error;
    }
  });

  ipcMain.handle("switch-to-ollama", async (_, model?: string, url?: string) => {
    try {
      const llmHelper = appState.processingHelper.getLLMHelper();
      await llmHelper.switchToOllama(model, url);
      return { success: true };
    } catch (error: any) {
      console.error("Error switching to Ollama:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("switch-to-gemini", async (_, apiKey?: string) => {
    try {
      const llmHelper = appState.processingHelper.getLLMHelper();
      await llmHelper.switchToGemini(apiKey);
      return { success: true };
    } catch (error: any) {
      console.error("Error switching to Gemini:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("test-llm-connection", async () => {
    try {
      const llmHelper = appState.processingHelper.getLLMHelper();
      const result = await llmHelper.testConnection();
      return result;
    } catch (error: any) {
      console.error("Error testing LLM connection:", error);
      return { success: false, error: error.message };
    }
  });

  // Audio monitoring handlers
  ipcMain.handle("start-audio-monitoring", async () => {
    try {
      appState.startAudioMonitoring();
      return { success: true };
    } catch (error: any) {
      console.error("Error starting audio monitoring:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("stop-audio-monitoring", async () => {
    try {
      appState.stopAudioMonitoring();
      return { success: true };
    } catch (error: any) {
      console.error("Error stopping audio monitoring:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("is-audio-monitoring-active", async () => {
    return appState.isAudioMonitoringActive();
  });

  ipcMain.handle("add-audio-chunk", async (event, chunk: any) => {
    try {
      appState.getAudioMonitor().addAudioChunk(chunk);
      return { success: true };
    } catch (error: any) {
      console.error("Error adding audio chunk:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("add-transcription", async (event, result: any) => {
    try {
      appState.getAudioMonitor().addTranscription(result);
      return { success: true };
    } catch (error: any) {
      console.error("Error adding transcription:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-transcriptions", async () => {
    try {
      return appState.getAudioMonitor().getTranscriptions();
    } catch (error: any) {
      console.error("Error getting transcriptions:", error);
      return [];
    }
  });

  ipcMain.handle("get-audio-context", async () => {
    try {
      return appState.getAudioMonitor().getFullContext();
    } catch (error: any) {
      console.error("Error getting audio context:", error);
      return "";
    }
  });

  ipcMain.handle("update-audio-config", async (event, config: any) => {
    try {
      appState.getAudioMonitor().updateConfig(config);
      return { success: true };
    } catch (error: any) {
      console.error("Error updating audio config:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-audio-config", async () => {
    try {
      return appState.getAudioMonitor().getConfig();
    } catch (error: any) {
      console.error("Error getting audio config:", error);
      return null;
    }
  });

  // Screen monitoring handlers
  ipcMain.handle("start-screen-monitoring", async () => {
    try {
      appState.startScreenMonitoring();
      return { success: true };
    } catch (error: any) {
      console.error("Error starting screen monitoring:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("stop-screen-monitoring", async () => {
    try {
      appState.stopScreenMonitoring();
      return { success: true };
    } catch (error: any) {
      console.error("Error stopping screen monitoring:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("is-screen-monitoring-active", async () => {
    return appState.isScreenMonitoringActive();
  });

  ipcMain.handle("get-screen-captures", async () => {
    try {
      return appState.getScreenMonitor().getScreenCaptures();
    } catch (error: any) {
      console.error("Error getting screen captures:", error);
      return [];
    }
  });

  ipcMain.handle("get-screen-context", async () => {
    try {
      return appState.getScreenMonitor().getScreenContext();
    } catch (error: any) {
      console.error("Error getting screen context:", error);
      return "";
    }
  });

  ipcMain.handle("update-screen-config", async (event, config: any) => {
    try {
      appState.getScreenMonitor().updateConfig(config);
      return { success: true };
    } catch (error: any) {
      console.error("Error updating screen config:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-screen-config", async () => {
    try {
      return appState.getScreenMonitor().getConfig();
    } catch (error: any) {
      console.error("Error getting screen config:", error);
      return null;
    }
  });

  // Context management handlers
  ipcMain.handle("add-manual-context", async (event, content: string, metadata?: any) => {
    try {
      appState.addManualContext(content, metadata);
      return { success: true };
    } catch (error: any) {
      console.error("Error adding manual context:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("add-chat-context", async (event, content: string, metadata?: any) => {
    try {
      appState.addChatContext(content, metadata);
      return { success: true };
    } catch (error: any) {
      console.error("Error adding chat context:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-full-context", async () => {
    try {
      return appState.getFullContext();
    } catch (error: any) {
      console.error("Error getting full context:", error);
      return "";
    }
  });

  ipcMain.handle("get-formatted-context-ai", async () => {
    try {
      return appState.getFormattedContextForAI();
    } catch (error: any) {
      console.error("Error getting formatted context for AI:", error);
      return "";
    }
  });

  ipcMain.handle("get-audio-context", async () => {
    try {
      return appState.getAudioContext();
    } catch (error: any) {
      console.error("Error getting audio context:", error);
      return "";
    }
  });

  ipcMain.handle("get-screen-context", async () => {
    try {
      return appState.getScreenContext();
    } catch (error: any) {
      console.error("Error getting screen context:", error);
      return "";
    }
  });

  ipcMain.handle("get-chat-context", async () => {
    try {
      return appState.getChatContext();
    } catch (error: any) {
      console.error("Error getting chat context:", error);
      return "";
    }
  });

  ipcMain.handle("clear-context-history", async () => {
    try {
      appState.getContextManager().clearHistory();
      return { success: true };
    } catch (error: any) {
      console.error("Error clearing context history:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-context-statistics", async () => {
    try {
      return appState.getContextManager().getStatistics();
    } catch (error: any) {
      console.error("Error getting context statistics:", error);
      return null;
    }
  });

  // Enhanced window positioning handlers
  ipcMain.handle("set-window-position", async (event, position: { x: number; y: number }) => {
    try {
      appState.windowHelper.setWindowPosition(position);
      return { success: true };
    } catch (error: any) {
      console.error("Error setting window position:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("set-window-opacity", async (event, opacity: number) => {
    try {
      appState.windowHelper.setWindowOpacity(opacity);
      return { success: true };
    } catch (error: any) {
      console.error("Error setting window opacity:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-window-opacity", async () => {
    try {
      return appState.windowHelper.getWindowOpacity();
    } catch (error: any) {
      console.error("Error getting window opacity:", error);
      return 1;
    }
  });

  ipcMain.handle("move-to-preset", async (event, preset: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') => {
    try {
      appState.windowHelper.moveToPreset(preset);
      return { success: true };
    } catch (error: any) {
      console.error("Error moving to preset:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("minimize-window", async () => {
    try {
      appState.windowHelper.minimizeWindow();
      return { success: true };
    } catch (error: any) {
      console.error("Error minimizing window:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("maximize-window", async () => {
    try {
      appState.windowHelper.maximizeWindow();
      return { success: true };
    } catch (error: any) {
      console.error("Error maximizing window:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("unmaximize-window", async () => {
    try {
      appState.windowHelper.unmaximizeWindow();
      return { success: true };
    } catch (error: any) {
      console.error("Error unmaximizing window:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("set-window-size", async (event, width: number, height: number) => {
    try {
      appState.windowHelper.setWindowSize(width, height);
      return { success: true };
    } catch (error: any) {
      console.error("Error setting window size:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-current-position", async () => {
    try {
      return appState.windowHelper.getCurrentPosition();
    } catch (error: any) {
      console.error("Error getting current position:", error);
      return null;
    }
  });

  ipcMain.handle("get-current-size", async () => {
    try {
      return appState.windowHelper.getCurrentSize();
    } catch (error: any) {
      console.error("Error getting current size:", error);
      return null;
    }
  });
}
