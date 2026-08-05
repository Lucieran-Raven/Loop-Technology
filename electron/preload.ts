import { contextBridge, ipcRenderer } from "electron"

// Types for the exposed Electron API
interface ElectronAPI {
  updateContentDimensions: (dimensions: {
    width: number
    height: number
  }) => Promise<void>
  getScreenshots: () => Promise<Array<{ path: string; preview: string }>>
  deleteScreenshot: (
    path: string
  ) => Promise<{ success: boolean; error?: string }>
  onScreenshotTaken: (
    callback: (data: { path: string; preview: string }) => void
  ) => () => void
  onSolutionsReady: (callback: (solutions: string) => void) => () => void
  onResetView: (callback: () => void) => () => void
  onSolutionStart: (callback: () => void) => () => void
  onDebugStart: (callback: () => void) => () => void
  onDebugSuccess: (callback: (data: any) => void) => () => void
  onSolutionError: (callback: (error: string) => void) => () => void
  onProcessingNoScreenshots: (callback: () => void) => () => void
  onProblemExtracted: (callback: (data: any) => void) => () => void
  onSolutionSuccess: (callback: (data: any) => void) => () => void

  onUnauthorized: (callback: () => void) => () => void
  onDebugError: (callback: (error: string) => void) => () => void
  takeScreenshot: () => Promise<void>
  moveWindowLeft: () => Promise<void>
  moveWindowRight: () => Promise<void>
  moveWindowUp: () => Promise<void>
  moveWindowDown: () => Promise<void>
  analyzeAudioFromBase64: (data: string, mimeType: string, conversationContext?: string) => Promise<{ text: string; timestamp: number }>
  analyzeAudioFile: (path: string) => Promise<{ text: string; timestamp: number }>
  analyzeImageFile: (path: string, audioContext?: string) => Promise<{ text: string; timestamp: number }>
  quitApp: () => Promise<void>
  
  // LLM Model Management
  getCurrentLlmConfig: () => Promise<{ provider: "ollama" | "gemini"; model: string; isOllama: boolean }>
  getAvailableOllamaModels: () => Promise<string[]>
  switchToOllama: (model?: string, url?: string) => Promise<{ success: boolean; error?: string }>
  switchToGemini: (apiKey?: string) => Promise<{ success: boolean; error?: string }>
  testLlmConnection: () => Promise<{ success: boolean; error?: string }>

  // Audio Monitoring
  startAudioMonitoring: () => Promise<{ success: boolean; error?: string }>
  stopAudioMonitoring: () => Promise<{ success: boolean; error?: string }>
  isAudioMonitoringActive: () => Promise<boolean>
  addAudioChunk: (chunk: any) => Promise<{ success: boolean; error?: string }>
  addTranscription: (result: any) => Promise<{ success: boolean; error?: string }>
  getTranscriptions: () => Promise<any[]>
  getAudioContext: () => Promise<string>
  updateAudioConfig: (config: any) => Promise<{ success: boolean; error?: string }>
  getAudioConfig: () => Promise<any>

  // Screen Monitoring
  startScreenMonitoring: () => Promise<{ success: boolean; error?: string }>
  stopScreenMonitoring: () => Promise<{ success: boolean; error?: string }>
  isScreenMonitoringActive: () => Promise<boolean>
  getScreenCaptures: () => Promise<any[]>
  getScreenContext: () => Promise<string>
  updateScreenConfig: (config: any) => Promise<{ success: boolean; error?: string }>
  getScreenConfig: () => Promise<any>

  // Context Management
  addManualContext: (content: string, metadata?: any) => Promise<{ success: boolean; error?: string }>
  addChatContext: (content: string, metadata?: any) => Promise<{ success: boolean; error?: string }>
  getFullContext: () => Promise<string>
  getFormattedContextAI: () => Promise<string>
  getAudioContext: () => Promise<string>
  getScreenContextFromManager: () => Promise<string>
  getChatContext: () => Promise<string>
  clearContextHistory: () => Promise<{ success: boolean; error?: string }>
  getContextStatistics: () => Promise<any>

  // Enhanced Window Positioning
  setWindowPosition: (position: { x: number; y: number }) => Promise<{ success: boolean; error?: string }>
  setWindowOpacity: (opacity: number) => Promise<{ success: boolean; error?: string }>
  getWindowOpacity: () => Promise<number>
  moveToPreset: (preset: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') => Promise<{ success: boolean; error?: string }>
  minimizeWindow: () => Promise<{ success: boolean; error?: string }>
  maximizeWindow: () => Promise<{ success: boolean; error?: string }>
  unmaximizeWindow: () => Promise<{ success: boolean; error?: string }>
  setWindowSize: (width: number, height: number) => Promise<{ success: boolean; error?: string }>
  getCurrentPosition: () => Promise<{ x: number; y: number } | null>
  getCurrentSize: () => Promise<{ width: number; height: number } | null>

  // Knowledge Base
  getKnowledgeDocuments: () => Promise<any[]>
  uploadKnowledgeDocument: (filePath: string, type: string) => Promise<any>
  deleteKnowledgeDocument: (id: string) => Promise<boolean>
  searchKnowledgeBase: (query: string) => Promise<any[]>
  getRelevantKnowledgeContext: (query: string, maxDocs?: number) => Promise<string>

  // Meeting Manager
  startMeetingSession: (title?: string) => Promise<{ success: boolean; sessionId?: string; error?: string }>
  endMeetingSession: () => Promise<{ success: boolean; session?: any; error?: string }>
  addMeetingTranscript: (text: string) => Promise<{ success: boolean; error?: string }>
  addMeetingScreenshot: (screenshotPath: string) => Promise<{ success: boolean; error?: string }>
  updateMeetingContext: (context: any) => Promise<{ success: boolean; error?: string }>
  getActiveMeetingSession: () => Promise<any>
  getAllMeetingSessions: () => Promise<any[]>
  generateMeetingSummary: (sessionId: string) => Promise<{ success: boolean; summary?: string; error?: string }>
  extractMeetingActionItems: (sessionId: string) => Promise<{ success: boolean; actionItems?: string[]; error?: string }>
  generateMeetingFullReport: (sessionId: string) => Promise<{ success: boolean; report?: any; error?: string }>
  deleteMeetingSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>

  // Email Generator
  generateFollowUpEmail: (sessionId: string) => Promise<{ success: boolean; email?: string; error?: string }>
  generateTechnicalFollowUpEmail: (sessionId: string) => Promise<{ success: boolean; email?: string; error?: string }>
  generateThankYouEmail: (sessionId: string) => Promise<{ success: boolean; email?: string; error?: string }>
  generateCustomEmail: (template: string, sessionId: string) => Promise<{ success: boolean; email?: string; error?: string }>

  // Platform Integration
  getActivePlatform: () => Promise<{ success: boolean; platform?: string | null; error?: string }>
  getAllPlatformsStatus: () => Promise<{ success: boolean; statuses?: Array<{ name: string; active: boolean }>; error?: string }>
  getPlatformInfo: (platformName: 'zoom' | 'teams' | 'meet') => Promise<{ success: boolean; info?: any; error?: string }>

  invoke: (channel: string, ...args: any[]) => Promise<any>
}

export const PROCESSING_EVENTS = {
  //global states
  UNAUTHORIZED: "procesing-unauthorized",
  NO_SCREENSHOTS: "processing-no-screenshots",

  //states for generating the initial solution
  INITIAL_START: "initial-start",
  PROBLEM_EXTRACTED: "problem-extracted",
  SOLUTION_SUCCESS: "solution-success",
  INITIAL_SOLUTION_ERROR: "solution-error",

  //states for processing the debugging
  DEBUG_START: "debug-start",
  DEBUG_SUCCESS: "debug-success",
  DEBUG_ERROR: "debug-error"
} as const

// Expose the Electron API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  updateContentDimensions: (dimensions: { width: number; height: number }) =>
    ipcRenderer.invoke("update-content-dimensions", dimensions),
  takeScreenshot: () => ipcRenderer.invoke("take-screenshot"),
  getScreenshots: () => ipcRenderer.invoke("get-screenshots"),
  deleteScreenshot: (path: string) =>
    ipcRenderer.invoke("delete-screenshot", path),

  // Event listeners
  onScreenshotTaken: (
    callback: (data: { path: string; preview: string }) => void
  ) => {
    const subscription = (_: any, data: { path: string; preview: string }) =>
      callback(data)
    ipcRenderer.on("screenshot-taken", subscription)
    return () => {
      ipcRenderer.removeListener("screenshot-taken", subscription)
    }
  },
  onSolutionsReady: (callback: (solutions: string) => void) => {
    const subscription = (_: any, solutions: string) => callback(solutions)
    ipcRenderer.on("solutions-ready", subscription)
    return () => {
      ipcRenderer.removeListener("solutions-ready", subscription)
    }
  },
  onResetView: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on("reset-view", subscription)
    return () => {
      ipcRenderer.removeListener("reset-view", subscription)
    }
  },
  onSolutionStart: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on(PROCESSING_EVENTS.INITIAL_START, subscription)
    return () => {
      ipcRenderer.removeListener(PROCESSING_EVENTS.INITIAL_START, subscription)
    }
  },
  onDebugStart: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on(PROCESSING_EVENTS.DEBUG_START, subscription)
    return () => {
      ipcRenderer.removeListener(PROCESSING_EVENTS.DEBUG_START, subscription)
    }
  },

  onDebugSuccess: (callback: (data: any) => void) => {
    ipcRenderer.on("debug-success", (_event, data) => callback(data))
    return () => {
      ipcRenderer.removeListener("debug-success", (_event, data) =>
        callback(data)
      )
    }
  },
  onDebugError: (callback: (error: string) => void) => {
    const subscription = (_: any, error: string) => callback(error)
    ipcRenderer.on(PROCESSING_EVENTS.DEBUG_ERROR, subscription)
    return () => {
      ipcRenderer.removeListener(PROCESSING_EVENTS.DEBUG_ERROR, subscription)
    }
  },
  onSolutionError: (callback: (error: string) => void) => {
    const subscription = (_: any, error: string) => callback(error)
    ipcRenderer.on(PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR, subscription)
    return () => {
      ipcRenderer.removeListener(
        PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR,
        subscription
      )
    }
  },
  onProcessingNoScreenshots: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on(PROCESSING_EVENTS.NO_SCREENSHOTS, subscription)
    return () => {
      ipcRenderer.removeListener(PROCESSING_EVENTS.NO_SCREENSHOTS, subscription)
    }
  },

  onProblemExtracted: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data)
    ipcRenderer.on(PROCESSING_EVENTS.PROBLEM_EXTRACTED, subscription)
    return () => {
      ipcRenderer.removeListener(
        PROCESSING_EVENTS.PROBLEM_EXTRACTED,
        subscription
      )
    }
  },
  onSolutionSuccess: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data)
    ipcRenderer.on(PROCESSING_EVENTS.SOLUTION_SUCCESS, subscription)
    return () => {
      ipcRenderer.removeListener(
        PROCESSING_EVENTS.SOLUTION_SUCCESS,
        subscription
      )
    }
  },
  onUnauthorized: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on(PROCESSING_EVENTS.UNAUTHORIZED, subscription)
    return () => {
      ipcRenderer.removeListener(PROCESSING_EVENTS.UNAUTHORIZED, subscription)
    }
  },
  moveWindowLeft: () => ipcRenderer.invoke("move-window-left"),
  moveWindowRight: () => ipcRenderer.invoke("move-window-right"),
  moveWindowUp: () => ipcRenderer.invoke("move-window-up"),
  moveWindowDown: () => ipcRenderer.invoke("move-window-down"),
  analyzeAudioFromBase64: (data: string, mimeType: string, conversationContext?: string) => ipcRenderer.invoke("analyze-audio-base64", data, mimeType, conversationContext),
  analyzeAudioFile: (path: string) => ipcRenderer.invoke("analyze-audio-file", path),
  analyzeImageFile: (path: string, audioContext?: string) => ipcRenderer.invoke("analyze-image-file", path, audioContext),
  quitApp: () => ipcRenderer.invoke("quit-app"),
  
  // LLM Model Management
  getCurrentLlmConfig: () => ipcRenderer.invoke("get-current-llm-config"),
  getAvailableOllamaModels: () => ipcRenderer.invoke("get-available-ollama-models"),
  switchToOllama: (model?: string, url?: string) => ipcRenderer.invoke("switch-to-ollama", model, url),
  switchToGemini: (apiKey?: string) => ipcRenderer.invoke("switch-to-gemini", apiKey),
  testLlmConnection: () => ipcRenderer.invoke("test-llm-connection"),

  // Audio Monitoring
  startAudioMonitoring: () => ipcRenderer.invoke("start-audio-monitoring"),
  stopAudioMonitoring: () => ipcRenderer.invoke("stop-audio-monitoring"),
  isAudioMonitoringActive: () => ipcRenderer.invoke("is-audio-monitoring-active"),
  addAudioChunk: (chunk: any) => ipcRenderer.invoke("add-audio-chunk", chunk),
  addTranscription: (result: any) => ipcRenderer.invoke("add-transcription", result),
  getTranscriptions: () => ipcRenderer.invoke("get-transcriptions"),
  getAudioContextFromMonitor: () => ipcRenderer.invoke("get-audio-context"),
  updateAudioConfig: (config: any) => ipcRenderer.invoke("update-audio-config", config),
  getAudioConfig: () => ipcRenderer.invoke("get-audio-config"),

  // Screen Monitoring
  startScreenMonitoring: () => ipcRenderer.invoke("start-screen-monitoring"),
  stopScreenMonitoring: () => ipcRenderer.invoke("stop-screen-monitoring"),
  isScreenMonitoringActive: () => ipcRenderer.invoke("is-screen-monitoring-active"),
  getScreenCaptures: () => ipcRenderer.invoke("get-screen-captures"),
  getScreenContext: () => ipcRenderer.invoke("get-screen-context"),
  updateScreenConfig: (config: any) => ipcRenderer.invoke("update-screen-config", config),
  getScreenConfig: () => ipcRenderer.invoke("get-screen-config"),

  // Context Management
  addManualContext: (content: string, metadata?: any) => ipcRenderer.invoke("add-manual-context", content, metadata),
  addChatContext: (content: string, metadata?: any) => ipcRenderer.invoke("add-chat-context", content, metadata),
  getFullContext: () => ipcRenderer.invoke("get-full-context"),
  getFormattedContextAI: () => ipcRenderer.invoke("get-formatted-context-ai"),
  getAudioContext: () => ipcRenderer.invoke("get-audio-context"),
  getScreenContextFromManager: () => ipcRenderer.invoke("get-screen-context"),
  getChatContext: () => ipcRenderer.invoke("get-chat-context"),
  clearContextHistory: () => ipcRenderer.invoke("clear-context-history"),
  getContextStatistics: () => ipcRenderer.invoke("get-context-statistics"),

  // Enhanced Window Positioning
  setWindowPosition: (position: { x: number; y: number }) => ipcRenderer.invoke("set-window-position", position),
  setWindowOpacity: (opacity: number) => ipcRenderer.invoke("set-window-opacity", opacity),
  getWindowOpacity: () => ipcRenderer.invoke("get-window-opacity"),
  moveToPreset: (preset: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') => ipcRenderer.invoke("move-to-preset", preset),
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
  unmaximizeWindow: () => ipcRenderer.invoke("unmaximize-window"),
  setWindowSize: (width: number, height: number) => ipcRenderer.invoke("set-window-size", width, height),
  getCurrentPosition: () => ipcRenderer.invoke("get-current-position"),
  getCurrentSize: () => ipcRenderer.invoke("get-current-size"),

  // Knowledge Base
  getKnowledgeDocuments: () => ipcRenderer.invoke("get-knowledge-documents"),
  uploadKnowledgeDocument: (filePath: string, type: string) => ipcRenderer.invoke("upload-knowledge-document", filePath, type),
  deleteKnowledgeDocument: (id: string) => ipcRenderer.invoke("delete-knowledge-document", id),
  searchKnowledgeBase: (query: string) => ipcRenderer.invoke("search-knowledge-base", query),
  getRelevantKnowledgeContext: (query: string, maxDocs?: number) => ipcRenderer.invoke("get-relevant-knowledge-context", query, maxDocs),

  // Meeting Manager
  startMeetingSession: (title?: string) => ipcRenderer.invoke("start-meeting-session", title),
  endMeetingSession: () => ipcRenderer.invoke("end-meeting-session"),
  addMeetingTranscript: (text: string) => ipcRenderer.invoke("add-meeting-transcript", text),
  addMeetingScreenshot: (screenshotPath: string) => ipcRenderer.invoke("add-meeting-screenshot", screenshotPath),
  updateMeetingContext: (context: any) => ipcRenderer.invoke("update-meeting-context", context),
  getActiveMeetingSession: () => ipcRenderer.invoke("get-active-meeting-session"),
  getAllMeetingSessions: () => ipcRenderer.invoke("get-all-meeting-sessions"),
  generateMeetingSummary: (sessionId: string) => ipcRenderer.invoke("generate-meeting-summary", sessionId),
  extractMeetingActionItems: (sessionId: string) => ipcRenderer.invoke("extract-meeting-action-items", sessionId),
  generateMeetingFullReport: (sessionId: string) => ipcRenderer.invoke("generate-meeting-full-report", sessionId),
  deleteMeetingSession: (sessionId: string) => ipcRenderer.invoke("delete-meeting-session", sessionId),

  // Email Generator
  generateFollowUpEmail: (sessionId: string) => ipcRenderer.invoke("generate-follow-up-email", sessionId),
  generateTechnicalFollowUpEmail: (sessionId: string) => ipcRenderer.invoke("generate-technical-follow-up-email", sessionId),
  generateThankYouEmail: (sessionId: string) => ipcRenderer.invoke("generate-thank-you-email", sessionId),
  generateCustomEmail: (template: string, sessionId: string) => ipcRenderer.invoke("generate-custom-email", template, sessionId),

  // Platform Integration
  getActivePlatform: () => ipcRenderer.invoke("get-active-platform"),
  getAllPlatformsStatus: () => ipcRenderer.invoke("get-all-platforms-status"),
  getPlatformInfo: (platformName: 'zoom' | 'teams' | 'meet') => ipcRenderer.invoke("get-platform-info", platformName),

  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args)
} as ElectronAPI)
