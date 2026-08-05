// electron/emailGenerator.ts
import { LLMHelper } from './LLMHelper';

export class EmailGenerator {
  private llmHelper: LLMHelper;

  constructor(llmHelper: LLMHelper) {
    this.llmHelper = llmHelper;
  }

  async generateFollowUp(session: any): Promise<string> {
    const prompt = `Draft a professional follow-up email for a job interview. Use this information:
    
    Interview Context:
    ${JSON.stringify(session.context)}
    
    Key Discussion Points:
    ${session.transcript.slice(-20).join('\n')}
    
    Action Items:
    ${session.actionItems?.join('\n') || 'None specified'}
    
    Generate a personalized, professional email with:
    1. Thank you note for the interviewer's time
    2. Highlight specific discussion points that went well
    3. Reference to any technical challenges or questions
    4. Next steps and availability for follow-up
    5. Professional closing
    
    Make it warm but professional, and include placeholders for personal details like [Interviewer Name], [Company Name], [Your Name], etc.`;
    
    try {
      return await this.llmHelper.generateContent(prompt);
    } catch (error) {
      console.error('Error generating follow-up email:', error);
      throw error;
    }
  }

  async generateTechnicalFollowUp(session: any): Promise<string> {
    const prompt = `Based on this technical interview, draft a follow-up email that:
    1. Thanks the interviewer for the technical discussion
    2. References specific technical challenges or problems solved
    3. Highlights your technical approach and reasoning
    4. Offers to clarify any points or provide additional code samples
    5. Expresses continued interest in the role
    
    Technical Interview Context:
    ${JSON.stringify(session.context)}
    
    Recent Technical Discussion:
    ${session.transcript.slice(-15).join('\n')}
    
    Include placeholders for [Interviewer Name], [Company Name], [Your Name], etc.`;
    
    try {
      return await this.llmHelper.generateContent(prompt);
    } catch (error) {
      console.error('Error generating technical follow-up email:', error);
      throw error;
    }
  }

  async generateThankYou(session: any): Promise<string> {
    const prompt = `Draft a simple thank-you email for a job interview. Use this information:
    
    Interview Context:
    ${JSON.stringify(session.context)}
    
    Generate a concise, professional thank-you email with:
    1. Thank you for the interview
    2. Mention one specific topic discussed
    3. Reiterate interest in the position
    4. Professional closing
    
    Keep it under 200 words and include placeholders for [Interviewer Name], [Company Name], [Your Name], etc.`;
    
    try {
      return await this.llmHelper.generateContent(prompt);
    } catch (error) {
      console.error('Error generating thank-you email:', error);
      throw error;
    }
  }

  async generateCustomEmail(template: string, session: any): Promise<string> {
    const prompt = `Generate a professional email based on this template and interview context:
    
    Template: ${template}
    
    Interview Context:
    ${JSON.stringify(session.context)}
    
    Key Discussion Points:
    ${session.transcript.slice(-10).join('\n')}
    
    Fill in the template with relevant details from the interview and make it professional and personalized. Include placeholders for any specific details that weren't mentioned in the interview.`;
    
    try {
      return await this.llmHelper.generateContent(prompt);
    } catch (error) {
      console.error('Error generating custom email:', error);
      throw error;
    }
  }
}