// src/components/MeetingSummary.tsx
import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Image, Download, Trash2, Play, StopCircle } from 'lucide-react';

interface MeetingSession {
  id: string;
  startTime: string;
  endTime: string;
  transcript: string[];
  screenshots: string[];
  context: any;
  summary?: string;
  actionItems?: string[];
  title?: string;
}

interface MeetingReport {
  summary: string;
  actionItems: string[];
  duration: string;
  transcriptLength: number;
  screenshotCount: number;
}

const MeetingSummary: React.FC = () => {
  const [sessions, setSessions] = useState<MeetingSession[]>([]);
  const [activeSession, setActiveSession] = useState<MeetingSession | null>(null);
  const [selectedSession, setSelectedSession] = useState<MeetingSession | null>(null);
  const [report, setReport] = useState<MeetingReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadSessions();
    checkActiveSession();
  }, []);

  const loadSessions = async () => {
    try {
      const allSessions = await window.electronAPI.getAllMeetingSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const checkActiveSession = async () => {
    try {
      const active = await window.electronAPI.getActiveMeetingSession();
      setActiveSession(active);
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const handleStartSession = async () => {
    try {
      const title = prompt('Enter session title (optional):');
      const result = await window.electronAPI.startMeetingSession(title || undefined);
      if (result.success) {
        await checkActiveSession();
        await loadSessions();
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      const result = await window.electronAPI.endMeetingSession();
      if (result.success) {
        await checkActiveSession();
        await loadSessions();
        if (result.session) {
          setSelectedSession(result.session);
        }
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleGenerateReport = async (session: MeetingSession) => {
    setIsGenerating(true);
    try {
      const result = await window.electronAPI.generateMeetingFullReport(session.id);
      if (result.success) {
        setReport(result.report);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        const result = await window.electronAPI.deleteMeetingSession(sessionId);
        if (result.success) {
          await loadSessions();
          if (selectedSession?.id === sessionId) {
            setSelectedSession(null);
            setReport(null);
          }
        }
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);
    return `${duration} min`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Meeting Summary</h2>
        <div className="flex gap-2">
          {activeSession ? (
            <button
              onClick={handleEndSession}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm cursor-pointer transition-colors"
            >
              <StopCircle size={16} />
              End Session
            </button>
          ) : (
            <button
              onClick={handleStartSession}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm cursor-pointer transition-colors"
            >
              <Play size={16} />
              Start Session
            </button>
          )}
        </div>
      </div>

      {activeSession && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Active Session: {activeSession.title || 'Untitled'}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-white font-medium">Sessions</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="text-center text-gray-400 py-4">No sessions yet</div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? 'bg-blue-500/20 border border-blue-500/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium truncate">
                      {session.title || 'Untitled Session'}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(session.startTime, session.endTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} />
                      {session.transcript.length} entries
                    </span>
                    <span className="flex items-center gap-1">
                      <Image size={12} />
                      {session.screenshots.length}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedSession && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Session Details</h3>
              {!report && (
                <button
                  onClick={() => handleGenerateReport(selectedSession)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white text-sm cursor-pointer transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </button>
              )}
            </div>

            {report ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Summary</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{report.summary}</p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Action Items</h4>
                  <ul className="space-y-1">
                    {report.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                        <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Duration: {report.duration}</span>
                  <span>Transcript entries: {report.transcriptLength}</span>
                  <span>Screenshots: {report.screenshotCount}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Select a session and generate report to see details
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingSummary;