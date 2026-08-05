// src/components/KnowledgeBase.tsx
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Search, Plus } from 'lucide-react';

interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'research' | 'other';
  content: string;
  uploadedAt: string;
  filePath: string;
}

const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocs, setFilteredDocs] = useState<KnowledgeDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<KnowledgeDocument['type']>('other');

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDocs(filtered);
    } else {
      setFilteredDocs(documents);
    }
  }, [searchQuery, documents]);

  const loadDocuments = async () => {
    try {
      const docs = await window.electronAPI.invoke('get-knowledge-documents');
      setDocuments(docs);
      setFilteredDocs(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const result = await window.electronAPI.invoke('upload-knowledge-document', file.path, selectedType);
        console.log('Uploaded document:', result);
      }
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await window.electronAPI.invoke('delete-knowledge-document', id);
      await loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getTypeColor = (type: KnowledgeDocument['type']) => {
    const colors = {
      resume: 'bg-blue-500',
      cover_letter: 'bg-green-500',
      portfolio: 'bg-purple-500',
      research: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Knowledge Base</h2>
        <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm cursor-pointer transition-colors">
          <Plus size={16} />
          Upload Document
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.pdf,.docx"
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as KnowledgeDocument['type'])}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="resume">Resume</option>
          <option value="cover_letter">Cover Letter</option>
          <option value="portfolio">Portfolio</option>
          <option value="research">Research</option>
          <option value="other">Other</option>
        </select>
      </div>

      {isUploading && (
        <div className="text-center text-gray-400 text-sm">
          Uploading document...
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredDocs.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {documents.length === 0 ? 'No documents uploaded yet' : 'No matching documents found'}
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className={`p-2 rounded-lg ${getTypeColor(doc.type)}`}>
                <FileText size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{doc.name}</h3>
                <p className="text-gray-400 text-xs capitalize">{doc.type.replace('_', ' ')}</p>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Delete document"
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-gray-400 text-center">
        {documents.length} document{documents.length !== 1 ? 's' : ''} in knowledge base
      </div>
    </div>
  );
};

export default KnowledgeBase;