// src/components/EmailDraft.tsx
import React, { useState, useEffect } from 'react';
import { Mail, Copy, Download, Send, FileText, CheckCircle } from 'lucide-react';

interface MeetingSession {
  id: string;
  startTime: string;
  title?: string;
  transcript: string[];
  context: any;
  actionItems?: string[];
}

const EmailDraft: React.FC = () => {
  const [sessions, setSessions] = useState<MeetingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<MeetingSession | null>(null);
  const [emailType, setEmailType] = useState<'follow-up' | 'technical' | 'thank-you' | 'custom'>('follow-up');
  const [customTemplate, setCustomTemplate] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const allSessions = await window.electronAPI.getAllMeetingSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleGenerateEmail = async () => {
    if (!selectedSession) return;

    setIsGenerating(true);
    try {
      let result;
      switch (emailType) {
        case 'follow-up':
          result = await window.electronAPI.generateFollowUpEmail(selectedSession.id);
          break;
        case 'technical':
          result = await window.electronAPI.generateTechnicalFollowUpEmail(selectedSession.id);
          break;
        case 'thank-you':
          result = await window.electronAPI.generateThankYouEmail(selectedSession.id);
          break;
        case 'custom':
          result = await window.electronAPI.generateCustomEmail(customTemplate, selectedSession.id);
          break;
        default:
          return;
      }

      if (result.success) {
        setGeneratedEmail(result.email || '');
      }
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEmail = () => {
    const blob = new Blob([generatedEmail], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `follow-up-email-${selectedSession?.id || 'draft'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const emailTypeOptions = [
    { value: 'follow-up', label: 'Follow-Up Email', description: 'Professional follow-up after interview' },
    { value: 'technical', label: 'Technical Follow-Up', description: 'Focus on technical discussions' },
    { value: 'thank-you', label: 'Thank You Email', description: 'Simple thank you note' },
    { value: 'custom', label: 'Custom Template', description: 'Use your own template' }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Email Draft Generator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Select Session</label>
            <select
              value={selectedSession?.id || ''}
              onChange={(e) => setSelectedSession(sessions.find(s => s.id === e.target.value) || null)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a session...</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.title || `Session ${new Date(session.startTime || Date.now()).toLocaleString()}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Email Type</label>
            <div className="space-y-2">
              {emailTypeOptions.map(option => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    emailType === option.value
                      ? 'bg-blue-500/20 border border-blue-500/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={emailType === option.value}
                    onChange={(e) => setEmailType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-gray-400 text-xs">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {emailType === 'custom' && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">Custom Template</label>
              <textarea
                value={customTemplate}
                onChange={(e) => setCustomTemplate(e.target.value)}
                placeholder="Enter your custom email template..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 h-24 resize-none"
              />
            </div>
          )}

          <button
            onClick={handleGenerateEmail}
            disabled={!selectedSession || isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-medium cursor-pointer transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Email'}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-white text-sm font-medium">Generated Email</label>
            {generatedEmail && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopyEmail}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-400" />}
                </button>
                <button
                  onClick={handleDownloadEmail}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Download email"
                >
                  <Download size={16} className="text-gray-400" />
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-lg min-h-[300px]">
            {generatedEmail ? (
              <textarea
                value={generatedEmail}
                onChange={(e) => setGeneratedEmail(e.target.value)}
                className="w-full h-full bg-transparent text-gray-300 text-sm resize-none focus:outline-none"
                rows={12}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Mail size={32} className="mb-2 opacity-50" />
                <p className="text-sm">Select a session and generate an email</p>
              </div>
            )}
          </div>

          {generatedEmail && (
            <div className="text-xs text-gray-400 text-center">
              {generatedEmail.split(/\s+/).length} words • {generatedEmail.length} characters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDraft;