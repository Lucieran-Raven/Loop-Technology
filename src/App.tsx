import { ToastProvider } from "./components/ui/toast"
import Queue from "./_pages/Queue"
import { ToastViewport } from "@radix-ui/react-toast"
import { useEffect, useRef, useState } from "react"
import Solutions from "./_pages/Solutions"
import { QueryClient, QueryClientProvider } from "react-query"

declare global {
  interface Window {
    electronAPI: {
      //RANDOM GETTER/SETTERS
      updateContentDimensions: (dimensions: {
        width: number
        height: number
      }) => Promise<void>
      getScreenshots: () => Promise<Array<{ path: string; preview: string }>>

      //GLOBAL EVENTS
      //TODO: CHECK THAT PROCESSING NO SCREENSHOTS AND TAKE SCREENSHOTS ARE BOTH CONDITIONAL
      onUnauthorized: (callback: () => void) => () => void
      onScreenshotTaken: (
        callback: (data: { path: string; preview: string }) => void
      ) => () => void
      onProcessingNoScreenshots: (callback: () => void) => () => void
      onResetView: (callback: () => void) => () => void
      takeScreenshot: () => Promise<void>

      //INITIAL SOLUTION EVENTS
      deleteScreenshot: (
        path: string
      ) => Promise<{ success: boolean; error?: string }>
      onSolutionStart: (callback: () => void) => () => void
      onSolutionError: (callback: (error: string) => void) => () => void
      onSolutionSuccess: (callback: (data: any) => void) => () => void
      onProblemExtracted: (callback: (data: any) => void) => () => void

      onDebugSuccess: (callback: (data: any) => void) => () => void

      onDebugStart: (callback: () => void) => () => void
      onDebugError: (callback: (error: string) => void) => () => void

      // Audio Processing
      analyzeAudioFromBase64: (data: string, mimeType: string, conversationContext?: string) => Promise<{ text: string; timestamp: number }>
      analyzeAudioFile: (path: string) => Promise<{ text: string; timestamp: number }>
      analyzeImageFile: (path: string, audioContext?: string) => Promise<{ text: string; timestamp: number }>

      moveWindowLeft: () => Promise<void>
      moveWindowRight: () => Promise<void>
      moveWindowUp: () => Promise<void>
      moveWindowDown: () => Promise<void>
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
      getAudioContextFromMonitor: () => Promise<string>
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
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: Infinity
    }
  }
})

const App: React.FC = () => {
  const [view, setView] = useState<"queue" | "solutions" | "debug">("queue")
  const containerRef = useRef<HTMLDivElement>(null)

  // Effect for height monitoring
  useEffect(() => {
    const cleanup = window.electronAPI.onResetView(() => {
      console.log("Received 'reset-view' message from main process.")
      queryClient.invalidateQueries(["screenshots"])
      queryClient.invalidateQueries(["problem_statement"])
      queryClient.invalidateQueries(["solution"])
      queryClient.invalidateQueries(["new_solution"])
      setView("queue")
    })

    return () => {
      cleanup()
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const updateHeight = () => {
      if (!containerRef.current) return
      const height = containerRef.current.scrollHeight
      const width = containerRef.current.scrollWidth
      window.electronAPI?.updateContentDimensions({ width, height })
    }

    const resizeObserver = new ResizeObserver(() => {
      updateHeight()
    })

    // Initial height update
    updateHeight()

    // Observe for changes
    resizeObserver.observe(containerRef.current)

    // Also update height when view changes
    const mutationObserver = new MutationObserver(() => {
      updateHeight()
    })

    mutationObserver.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [view]) // Re-run when view changes

  useEffect(() => {
    const cleanupFunctions = [
      window.electronAPI.onSolutionStart(() => {
        setView("solutions")
        console.log("starting processing")
      }),

      window.electronAPI.onUnauthorized(() => {
        queryClient.removeQueries(["screenshots"])
        queryClient.removeQueries(["solution"])
        queryClient.removeQueries(["problem_statement"])
        setView("queue")
        console.log("Unauthorized")
      }),
      // Update this reset handler
      window.electronAPI.onResetView(() => {
        console.log("Received 'reset-view' message from main process")

        queryClient.removeQueries(["screenshots"])
        queryClient.removeQueries(["solution"])
        queryClient.removeQueries(["problem_statement"])
        setView("queue")
        console.log("View reset to 'queue' via Command+R shortcut")
      }),
      window.electronAPI.onProblemExtracted((data: any) => {
        if (view === "queue") {
          console.log("Problem extracted successfully")
          queryClient.invalidateQueries(["problem_statement"])
          queryClient.setQueryData(["problem_statement"], data)
        }
      })
    ]
    return () => cleanupFunctions.forEach((cleanup) => cleanup())
  }, [])

  return (
    <div ref={containerRef} className="min-h-0">
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {view === "queue" ? (
            <Queue setView={setView} />
          ) : view === "solutions" ? (
            <Solutions setView={setView} />
          ) : (
            <></>
          )}
          <ToastViewport />
        </ToastProvider>
      </QueryClientProvider>
    </div>
  )
}

export default App
