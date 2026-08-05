// electron/knowledgeBase.ts
import fs from 'fs-extra';
import path from 'path';
import mammoth from 'mammoth';

interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'research' | 'other';
  content: string;
  uploadedAt: Date;
  filePath: string;
}

export class KnowledgeBase {
  private basePath: string;
  private documents: KnowledgeDocument[] = [];

  constructor(userDataPath: string) {
    this.basePath = path.join(userDataPath, 'knowledge-base');
    fs.ensureDirSync(this.basePath);
    this.loadDocuments();
  }

  async uploadDocument(filePath: string, type: KnowledgeDocument['type']): Promise<KnowledgeDocument> {
    const fileName = path.basename(filePath);
    const destPath = path.join(this.basePath, fileName);
    await fs.copy(filePath, destPath);
    
    // Extract text content based on file type
    const content = await this.extractContent(destPath);
    
    const doc: KnowledgeDocument = {
      id: Date.now().toString(),
      name: fileName,
      type,
      content,
      uploadedAt: new Date(),
      filePath: destPath
    };
    
    this.documents.push(doc);
    await this.saveDocuments();
    return doc;
  }

  private async extractContent(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      if (ext === '.txt' || ext === '.md' || ext === '.json') {
        return fs.readFileSync(filePath, 'utf-8');
      }
      
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(dataBuffer);
        return data.text;
      }
      
      if (ext === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      }
      
      if (ext === '.doc') {
        // .doc files are harder to parse, return placeholder
        return '[DOC file content extraction not supported - please convert to DOCX]';
      }
      
      return '';
    } catch (error) {
      console.error(`Error extracting content from ${filePath}:`, error);
      return '[Error extracting content]';
    }
  }

  async search(query: string): Promise<KnowledgeDocument[]> {
    const lowerQuery = query.toLowerCase();
    return this.documents.filter(doc => 
      doc.content.toLowerCase().includes(lowerQuery) ||
      doc.name.toLowerCase().includes(lowerQuery)
    );
  }

  async getDocumentById(id: string): Promise<KnowledgeDocument | null> {
    return this.documents.find(doc => doc.id === id) || null;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index !== -1) {
      const doc = this.documents[index];
      try {
        await fs.unlink(doc.filePath);
        this.documents.splice(index, 1);
        await this.saveDocuments();
        return true;
      } catch (error) {
        console.error('Error deleting document:', error);
        return false;
      }
    }
    return false;
  }

  async getAllDocuments(): Promise<KnowledgeDocument[]> {
    return [...this.documents];
  }

  async getDocumentsByType(type: KnowledgeDocument['type']): Promise<KnowledgeDocument[]> {
    return this.documents.filter(doc => doc.type === type);
  }

  private async saveDocuments() {
    await fs.writeJSON(path.join(this.basePath, 'index.json'), this.documents);
  }

  private async loadDocuments() {
    try {
      const index = await fs.readJSON(path.join(this.basePath, 'index.json'));
      this.documents = index;
    } catch (e) {
      this.documents = [];
    }
  }

  async getRelevantContext(query: string, maxDocs: number = 3): Promise<string> {
    const relevantDocs = await this.search(query);
    const topDocs = relevantDocs.slice(0, maxDocs);
    
    if (topDocs.length === 0) {
      return '';
    }
    
    return topDocs.map(doc => 
      `Document: ${doc.name}\nType: ${doc.type}\nContent: ${doc.content.substring(0, 2000)}...`
    ).join('\n\n---\n\n');
  }
}