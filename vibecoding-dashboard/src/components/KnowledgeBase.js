/**
 * KnowledgeBase Component
 * Split-pane viewer for project knowledge files (AGENTS_CONFIG, TECHNICAL_DIRECTIVES, etc.)
 */

import React, { useState, useEffect } from 'react';
import { FileText, Edit, Eye, Upload, X, Copy, Check, BookOpen, Settings } from 'lucide-react';
import * as api from '../services/api';

export default function KnowledgeBase({ project }) {
  const [knowledgeFiles, setKnowledgeFiles] = useState([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'docs'
  const [viewMode, setViewMode] = useState('view'); // 'view' | 'edit' | 'raw'
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (project?.id) {
      loadKnowledgeFiles();
      loadKnowledgeDocs();
    }
  }, [project?.id]);

  const loadKnowledgeFiles = async () => {
    try {
      const result = await api.getKnowledgeFiles(project.id);
      if (result.error) {
        console.error('Error loading knowledge files:', result.error);
        setKnowledgeFiles([]);
      } else {
        // API returns object like { PROJECT_MAP: "...", AGENTS_CONFIG: "..." }
        // Convert to array format for display
        const files = Object.entries(result.data || {})
          .filter(([file_type, content]) => content && content.trim()) // Only show files with content
          .map(([file_type, content]) => ({
            id: file_type,
            file_type,
            content: content || '',
            updated_at: new Date().toISOString()
          }));
        setKnowledgeFiles(files);
      }
    } catch (err) {
      console.error('Failed to load knowledge files:', err);
      setKnowledgeFiles([]);
    }
  };

  const loadKnowledgeDocs = async () => {
    setIsLoading(true);
    try {
      const result = await api.getKnowledgeDocs(project.id);
      if (result.error) {
        console.error('Error loading knowledge docs:', result.error);
        setKnowledgeDocs([]);
      } else {
        setKnowledgeDocs(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load knowledge docs:', err);
      setKnowledgeDocs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setSelectedDoc(null);
    setEditContent(file.content || '');
    setViewMode('view');
  };

  const handleDocSelect = (doc) => {
    setSelectedDoc(doc);
    setSelectedFile(null);
    setEditContent(doc.content_md || '');
    setViewMode('view');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedFile) {
        // Save knowledge file
        const result = await api.updateKnowledgeFile(
          project.id,
          selectedFile.file_type,
          editContent
        );

        if (result.error) {
          alert(`Failed to save: ${result.error.error || 'Unknown error'}`);
          return;
        }

        await loadKnowledgeFiles();
      } else if (selectedDoc) {
        // Save knowledge doc
        const result = await api.updateKnowledgeDoc(selectedDoc.id, {
          title: selectedDoc.title,
          content_md: editContent,
          tags: selectedDoc.tags
        });

        if (result.error) {
          alert(`Failed to save: ${result.error.error || 'Unknown error'}`);
          return;
        }

        await loadKnowledgeDocs();
      }

      setViewMode('view');
      alert('✅ Saved successfully!');
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    const content = selectedFile?.content || selectedDoc?.content_md;
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'AGENTS_CONFIG':
        return '👥';
      case 'MCP_CONFIG':
        return '🔌';
      case 'TECHNICAL_DIRECTIVES':
        return '📚';
      case 'PROJECT_MAP':
        return '🗺️';
      default:
        return '📄';
    }
  };

  const formatFileSize = (content) => {
    if (!content) return '0 bytes';
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading knowledge base...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">📚 Knowledge Base</h2>
        <p className="text-sm text-gray-400">
          Project context and technical documentation for the Orchestrator
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-4 flex gap-2 border-b border-gray-700">
        <button
          onClick={() => {
            setActiveTab('files');
            setSelectedFile(null);
            setSelectedDoc(null);
          }}
          className={`px-4 py-2 flex items-center gap-2 transition-colors ${
            activeTab === 'files'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Settings size={18} />
          Config Files
        </button>
        <button
          onClick={() => {
            setActiveTab('docs');
            setSelectedFile(null);
            setSelectedDoc(null);
          }}
          className={`px-4 py-2 flex items-center gap-2 transition-colors ${
            activeTab === 'docs'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <BookOpen size={18} />
          Technical Docs
        </button>
      </div>

      {/* Split Pane Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Pane: File/Doc List */}
        <div className="w-1/3 bg-gray-800 rounded-lg p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              {activeTab === 'files' ? 'Config Files' : 'Technical Documents'}
            </h3>
            <p className="text-xs text-gray-400">
              {activeTab === 'files' 
                ? `${knowledgeFiles.length} file${knowledgeFiles.length !== 1 ? 's' : ''}`
                : `${knowledgeDocs.length} doc${knowledgeDocs.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>

          {activeTab === 'files' ? (
            knowledgeFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No config files yet</p>
                <p className="text-xs mt-1">Files will appear here after project setup</p>
              </div>
            ) : (
              <div className="space-y-2">
                {knowledgeFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedFile?.id === file.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getFileIcon(file.file_type)}</span>
                      <span className="font-medium text-sm">{file.file_type}</span>
                    </div>
                    <div className="text-xs opacity-75">
                      {formatFileSize(file.content)}
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            knowledgeDocs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BookOpen size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No technical docs yet</p>
                <p className="text-xs mt-1">Docs will appear after Bootstrap Sprint</p>
              </div>
            ) : (
              <div className="space-y-2">
                {knowledgeDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocSelect(doc)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedDoc?.id === doc.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{doc.title}</div>
                    {doc.tags && (
                      <div className="text-xs opacity-75 mb-1">
                        Tags: {doc.tags}
                      </div>
                    )}
                    <div className="text-xs opacity-75">
                      {formatFileSize(doc.content_md)}
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>

        {/* Right Pane: Viewer/Editor */}
        <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-y-auto flex flex-col">
          {(selectedFile || selectedDoc) ? (
            <>
              {/* Toolbar */}
              <div className="mb-4 flex items-center justify-between border-b border-gray-700 pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedFile 
                      ? `${getFileIcon(selectedFile.file_type)} ${selectedFile.file_type}`
                      : selectedDoc?.title
                    }
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Last updated: {(selectedFile?.updated_at || selectedDoc?.updated_at)
                      ? new Date(selectedFile?.updated_at || selectedDoc?.updated_at).toLocaleString()
                      : 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={() => setViewMode(viewMode === 'edit' ? 'view' : 'edit')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                    title={viewMode === 'edit' ? 'Cancel edit' : 'Edit file'}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode(viewMode === 'raw' ? 'view' : 'raw')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                    title="Toggle raw view"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {viewMode === 'edit' ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full bg-gray-900 text-white p-4 rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Edit content..."
                  />
                ) : viewMode === 'raw' ? (
                  <pre className="bg-gray-900 text-white p-4 rounded font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                    {selectedFile?.content || selectedDoc?.content_md}
                  </pre>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-gray-900 text-gray-300 p-4 rounded whitespace-pre-wrap font-mono text-sm">
                      {selectedFile?.content || selectedDoc?.content_md}
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button (when editing) */}
              {viewMode === 'edit' && (
                <div className="mt-4 flex justify-end gap-2 border-t border-gray-700 pt-3">
                  <button
                    onClick={() => {
                      setViewMode('view');
                      setEditContent(selectedFile?.content || selectedDoc?.content_md || '');
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                <p>Select a knowledge file to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

