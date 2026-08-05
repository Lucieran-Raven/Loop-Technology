// electron/meetingManager.ts
import { LLMHelper } from './LLMHelper';

interface InterviewSession {
  id: string;
  startTime: Date;
  endTime: Date;
  transcript: string[];
  screenshots: string[];
  context: any;
  summary?: string;
  actionItems?: string[];
  title?: string;
}

export class MeetingManager {
  private sessions: InterviewSession[] = [];
  private activeSession: InterviewSession | null = null;
  private llmHelper: LLMHelper;

  constructor(llmHelper: LLMHelper) {
    this.llmHelper = llmHelper;
  }

  startSession(title?: string): string {
    const session: InterviewSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: new Date(),
      transcript: [],
      screenshots: [],
      context: {},
      title: title || `Session ${new Date().toLocaleString()}`
    };
    this.activeSession = session;
    this.sessions.push(session);
    return session.id;
  }

  endSession(): InterviewSession | null {
    if (this.activeSession) {
      this.activeSession.endTime = new Date();
      const session = this.activeSession;
      this.activeSession = null;
      return session;
    }
    return null;
  }

  addTranscript(text: string): void {
    if (this.activeSession) {
      this.activeSession.transcript.push(text);
    }
  }

  addScreenshot(screenshotPath: string): void {
    if (this.activeSession) {
      this.activeSession.screenshots.push(screenshotPath);
    }
  }

  updateContext(context: any): void {
    if (this.activeSession) {
      this.activeSession.context = { ...this.activeSession.context, ...context };
    }
  }

  getActiveSession(): InterviewSession | null {
    return this.activeSession;
  }

  getSessionById(id: string): InterviewSession | null {
    return this.sessions.find(session => session.id === id) || null;
  }

  getAllSessions(): InterviewSession[] {
    return [...this.sessions];
  }

  async generateSummary(session: InterviewSession): Promise<string> {
    const prompt = `Generate a comprehensive post-interview summary based on the following transcript and context. Include:
    1. Overall interview flow and key topics discussed
    2. Candidate strengths demonstrated
    3. Areas of improvement or concerns
    4. Technical skills assessed and performance
    5. Cultural fit observations
    6. Overall recommendation
    
    Transcript:
    ${session.transcript.join('\n')}
    
    Context:
    ${JSON.stringify(session.context)}`;
    
    try {
      const response = await this.llmHelper.generateContent(prompt);
      session.summary = response;
      return response;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  async extractActionItems(session: InterviewSession): Promise<string[]> {
    const prompt = `Extract all action items, next steps, and follow-up tasks from this interview transcript. List them as a JSON array of strings with clear, actionable items:
    ${session.transcript.join('\n')}`;
    
    try {
      const response = await this.llmHelper.generateContent(prompt);
      try {
        session.actionItems = JSON.parse(response);
      } catch {
        session.actionItems = response.split('\n').filter(item => item.trim().length > 0);
      }
      return session.actionItems || [];
    } catch (error) {
      console.error('Error extracting action items:', error);
      throw error;
    }
  }

  async generateFullReport(session: InterviewSession): Promise<{
    summary: string;
    actionItems: string[];
    duration: string;
    transcriptLength: number;
    screenshotCount: number;
  }> {
    const summary = await this.generateSummary(session);
    const actionItems = await this.extractActionItems(session);
    
    const duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000); // minutes
    
    return {
      summary,
      actionItems,
      duration: `${duration} minutes`,
      transcriptLength: session.transcript.length,
      screenshotCount: session.screenshots.length
    };
  }

  deleteSession(id: string): boolean {
    const index = this.sessions.findIndex(session => session.id === id);
    if (index !== -1) {
      this.sessions.splice(index, 1);
      return true;
    }
    return false;
  }

  clearAllSessions(): void {
    this.sessions = [];
    this.activeSession = null;
  }
}